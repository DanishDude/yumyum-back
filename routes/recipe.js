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

router.get('/user-recipes', (req, res, next) => {
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

// TODO modify and delete image
router.get('/recipeImage/:id', (req, res, next) => {
  try {
    const id = req.params.id;
    connection.query('SELECT image FROM recipe WHERE id = ?', id, (err, result) => {
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
      if (results) {
        connection.query(`SELECT * FROM recipe WHERE id=${results.insertId}`, (error, recipe) => {
          res.status(201).send(recipe[0]);
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/recipe/:id', upload.single('image'), (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.filename;
    const { id } = req.params;
    console.log(req.body);

    connection.query(`UPDATE recipe SET ? WHERE id = ${id}`, [req.body, id], (err, results) => {
      res.status(200).send(results);
    });
  } catch (err) {
    next(err);
  }
});

router.get('/recipe/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    connection.query(`SELECT * FROM recipe WHERE id = ${id}`, (err, results) => {
      res.status(200).send(results);
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/recipe/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    connection.query(`SELECT id, image FROM recipe WHERE id = ${id}`, (err, result) => {
      const filePath = `./public/images/${result[0].image}`;
      if (result[0].image) {
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlink(filePath, (e) => {
              console.log(e);
            });
          } else {
            console.log(error);
          }
        });
      }
    });

    connection.query(`DELETE FROM recipe WHERE id=${id}`, (err) => {
      if (err) {
        res.status(500).send('Ah Snap :-/');
      } else {
        res.status(200).send(`recipe ${id} deleted`);
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
