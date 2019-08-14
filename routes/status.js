import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all status types
router.get('/status', (req, res) => {
  connection.query('SELECT * FROM status;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add status
router.post('/status', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO status SET ?', formData, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Modify status
router.put('/status/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE status SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete status
router.delete('/status/:id', (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM status WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
