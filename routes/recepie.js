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
  if (acceptableFileTypes.includes(file.mimeType)) {
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

// Add recepie
router.post('/recepie', upload.single('recepieImage'), (req, res) => {
  console.log('REQ.FILE', req.file); // https://www.youtube.com/watch?v=srPXMt1Q0nY
  connection.query('INSERT INTO recepie SET ?', req.body, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Ah Snap :-/');
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
router.delete('/recepie/:id', (req, res) => {
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
