import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all recepies
router.get('/recepie', (req, res) => {
  connection.query('SELECT * FROM recepie;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add recepie
router.post('/recepie', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO recepie SET ?', formData, (err, results) => {
    if (err) {
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
