import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all orders
router.get('/orders', (req, res) => {
  connection.query('SELECT * FROM orders;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add orders
router.post('/orders', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO orders SET ?', formData, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Modify orders
router.put('/orders/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE orders SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete orders
router.delete('/orders/:id', (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM orders WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
