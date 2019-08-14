import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all products
router.get('/product', (req, res) => {
  connection.query('SELECT * FROM product;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add product
router.post('/product', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO product SET ?', formData, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Modify product
router.put('/product/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE product SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete product
router.delete('/product/:id', (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM product WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
