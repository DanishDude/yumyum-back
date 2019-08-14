import express from 'express';

const connection = require('../conf');

const router = express.Router();

// Get all customers
router.get('/customer', (req, res) => {
  connection.query('SELECT * FROM customer;', (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Add customer
router.post('/customer', (req, res) => {
  const formData = req.body;
  connection.query('INSERT INTO customer SET ?', formData, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Modify customer
router.put('/customer/:id', (req, res) => {
  const formData = req.body;
  const id = req.params.id;
  connection.query('UPDATE customer SET ? WHERE id = ?', [formData, id], (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

// Delete customer
router.delete('/customer/:id', (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM customer WHERE id=${id}`, (err, results) => {
    if (err) {
      res.status(500).send('Ah Snap :-/');
    } else {
      res.json(results);
    }
  });
});

export default router;
