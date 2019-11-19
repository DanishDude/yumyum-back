const express = require('express');
const connection = require('../conf');
const multer = require('multer');

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

// Get all recipes
router.get('/recipe', (req, res) => {
  connection.query('SELECT * FROM recipe;', (err, recipes) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(recipes);
    }
  });
});

// Get 1 recipe by id
router.get('/recipe/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Recipe id ${id}`);

  connection.query('SELECT * FROM recipe WHERE id = ?', id, (err, recipe) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      console.log('RECIPE ', recipe);

      res.json(recipe).sendFile(`../public/images/${recipe.image}`);
    }
  });
});

// Get recipe image by recipe id
router.get('/recipeImage/:id', (req, res) => { // TODO resolve app crash when sending id that does not exist
  const id = req.params.id;

  connection.query('SELECT image FROM recipe WHERE id = ?', id, (err, result) => {
    const fileName = result[0].image;
    const options = {
      root: 'public/images/',
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };

    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.sendFile(fileName, options, () => {
        if (err) throw new Error(err);
      });
    }
  });
});

router.post('/recipe', upload.single('recipeImage'), (req, res) => {
  req.body.image = req.file.filename;
  connection.query('INSERT INTO recipe SET ?', req.body, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Modify recipe
router.put('/recipe/:id', (req, res) => {
  try {
    const formData = req.body;
    const id = req.params.id;
    console.log(id, formData);

    connection.query('UPDATE recipe SET ? WHERE id = ?', [formData, id], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('Ah Snap :-/');
      } else {
        res.json(results);
      }
    });
  } catch (e) {
    throw new Error(e);
  }
});

// Delete recipe
router.delete('/recipe/:id', (req, res) => { // TODO delete recipe image as well
  const id = req.params.id;
  connection.query(`DELETE FROM recipe WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
