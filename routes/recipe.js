const express = require('express');
const connection = require('../conf');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const acceptableFileTypes = ['image/jpeg', 'image/png'];
const fileFilter = (req, file, cb) => {
  if (acceptableFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg or .png files are accepted'), false);
  }
};

const upload = multer({
  storage,
  Limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter
});

router.get('/recipes', (req, res) => {
  connection.query('SELECT * FROM recipe;', (err, recipes) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(recipes);
    }
  });
});

router.get('/user/recipes', (req, res, next) => {
  try {
    if (req.user) {
      connection.query(`SELECT * FROM recipe WHERE user_id = ${req.user.id}`, (err, recipes) => {
        res.status(200).send(recipes);
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/recipe/:id/image', (req, res, next) => {
  try {
    const id = req.params.id;
    connection.query('SELECT image FROM recipe WHERE id = ?', id, (err, result) => {
      if (!result[0].image) {
        res.status(404).send('not found');
      } else {
        const fileName = result[0].image || 'empty_plate_1575398123409.jpg';

        const options = {
          root: 'public/images/',
          dotfiles: 'deny',
          headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
          }
        };

        res.sendFile(fileName, options, () => {
          if (err) throw new Error(err);
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

// If no image / file sent - app crash
router.post('/recipe', upload.single('image'), (req, res, next) => {
  try {
    if (req.user) req.body.user_id = req.user.id;
    if (req.file) req.body.image = req.file.filename;

    connection.query('INSERT INTO recipe SET ?', req.body, (err, results) => {
      if (results.insertId > 0 && results.serverStatus === 2) {
        connection.query(`SELECT * FROM recipe WHERE id=${results.insertId}`, (error, recipe) => {
          res.status(201).send(recipe[0]);
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/recipe/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    connection.query(`SELECT * FROM recipe WHERE id=${id}`, (error, recipe) => {
      if (!recipe[0]) {
        res.status(404).send('not found');
      } else {
        res.status(200).send(recipe[0]);
      };
    });
  } catch (err) {
    next(err);
  };
});

router.put('/recipe/:id', upload.single('image'), (req, res, next) => {
  try {
    console.log(req.body);
    
    if (req.file) req.body.image = req.file.filename;
    const { id } = req.params;
    let oldImage;

    connection.query(`SELECT * FROM recipe WHERE id=${id}`, (error, recipe) => {
      if (recipe[0].user_id !== req.user.id) {
        res.status(403).send('unauthorised');
        next();
      }
      if (!error) {
        oldImage = recipe[0].image;
      }
    });

    connection.query(`UPDATE recipe SET ? WHERE id = ${id}`, [req.body, id], (err, results) => {
      if (results.serverStatus === 2) {
        if (oldImage) {
          const filePath = `./public/images/${oldImage}`;
          fs.access(filePath, (error) => {
            if (!error) {
              fs.unlink(filePath, e => console.log(e));
            } else {
              console.log(error);
            }
          });
        }
        connection.query(`SELECT * FROM recipe WHERE id=${id}`, (error, recipe) => {
          res.status(200).send(recipe[0]);
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/recipe/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    connection.query(`SELECT * FROM recipe WHERE id = ${id}`, (err, results) => {
      if (!results[0]) {
        res.status(404).send('not found');
      } else {
        res.status(200).send(results);
      }
    });
  } catch (err) {
    next(err);
  }
})
  .delete('/recipe/:id', (req, res, next) => {
    try {
      const { id } = req.params;

      connection.query(`SELECT id, user_id, image FROM recipe WHERE id = ${id}`, (err, recipe) => {
        if (!recipe[0]) {
          res.status(404).send(`recipe with id ${id} not found`);
        } else if (!req.user || recipe[0].user_id !== req.user.id) {
          res.status(403).send('unauthorised');
        } else {
          connection.query(`DELETE FROM recipe WHERE id = ${id}`, (error, result) => {
            if (result.affectedRows === 0) {
              res.status(500).send(`delete recipe ${id} failed`);
            } else {
              if (recipe[0].image) {
                const filePath = `./public/images/${recipe[0].image}`;

                fs.access(filePath, (e) => {
                  if (!e) {
                    fs.unlink(filePath, (er) => {
                      if (er) console.log(er);
                    });
                  } else {
                    console.log(e);
                  }
                });
              }
              res.status(200).send(`recipe with id ${id} deleted`);
            }
          });
        }
      });
    } catch (err) {
      next(err);
    }
  });

export default router;
