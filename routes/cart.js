import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all carts
router.get('/cart', (req, res) => {
  connection.query('SELECT * FROM cart;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add cart
router.post('/cart', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO cart SET ?', formData, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Modify cart
router.put('/cart/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE cart SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete cart
router.delete('/cart/:id', (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM cart WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
