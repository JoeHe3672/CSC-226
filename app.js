// Import dependencies
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes

// 1. Create a new car entry
app.post('/cars', async (req, res) => {
  const { make, model, year } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cars (make, model, year) VALUES ($1, $2, $3) RETURNING *',
      [make, model, year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create car entry.' });
  }
});

// 2. Get all car entries
app.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cars.' });
  }
});

// 3. Get a specific car entry by ID
app.get('/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch car.' });
  }
});

// 4. Update a car entry
app.put('/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { make, model, year } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cars SET make = $1, model = $2, year = $3 WHERE id = $4 RETURNING *',
      [make, model, year, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update car.' });
  }
});

// 5. Delete a car entry
app.delete('/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    res.status(200).json({ message: 'Car deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete car.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Database Schema
// CREATE TABLE cars (
//   id SERIAL PRIMARY KEY,
//   make VARCHAR(100) NOT NULL,
//   model VARCHAR(100) NOT NULL,
//   year INT NOT NULL
// );
