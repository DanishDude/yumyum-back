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

// Get all recepies
router.get('/recepie', (req, res) => {
  connection.query('SELECT * FROM recepie;', (err, recepies) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(recepies);
    }
  });
});

// Get 1 recepie by id
router.get('/recepie/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);

  connection.query('SELECT * FROM recepie WHERE id = ?', id, (err, recepie) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      console.log('RECEPIE ', recepie);

      res.json(recepie).sendFile(`../public/images/${recepie.image}`);
    }
  });
});

// Get recepie image by recepie id
router.get('/recepieImage/:id', (req, res) => { // TODO resolve app crash when sending id that does not exist
  const id = req.params.id;

  connection.query('SELECT image FROM recepie WHERE id = ?', id, (err, result) => {
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
      console.log('RESULT', result);

      res.sendFile(fileName, options, () => {
        if (err) {
          throw new Error(err);
        } else {
          console.log(' Sent', fileName);
        }
      });
    }
  });
});

router.post('/recepie', upload.single('recepieImage'), (req, res) => {
  console.log(req.file);

  req.body.image = req.file.filename;
  connection.query('INSERT INTO recepie SET ?', req.body, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Modify recepie
router.put('/recepie/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE recepie SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete recepie
router.delete('/recepie/:id', (req, res) => { // TODO delete recepie image as well
  const id = req.params.id;
  connection.query(`DELETE FROM recepie WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
