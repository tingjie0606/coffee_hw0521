// app.js
const express = require('express');
const cors = require('cors');
const { db, initializeDatabase } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/api/quotes', (req, res) => {
  const query = req.query.q || '';
  const date = req.query.date || '';
  const product = req.query.product || '';
  const price = req.query.price || '';

  let sql = 'SELECT * FROM prices WHERE 1=1';
  const params = [];

  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  }
  if (product) {
    sql += ' AND product = ?';
    params.push(product);
  }
  if (price) {
    sql += ' AND price LIKE ?';
    params.push(`%${price}%`);
  }
  if (query) {
    sql += ' AND (date LIKE ? OR product LIKE ? OR price LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('查詢失敗:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/dates', (req, res) => {
  const sql = 'SELECT DISTINCT date FROM prices ORDER BY date';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('獲取日期失敗:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.date));
  });
});

app.get('/api/products', (req, res) => {
  const sql = 'SELECT DISTINCT product FROM prices';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('獲取商品名稱失敗:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.product));
  });
});

const port = process.env.PORT || 3000;
app.set('port', port);

module.exports = app;