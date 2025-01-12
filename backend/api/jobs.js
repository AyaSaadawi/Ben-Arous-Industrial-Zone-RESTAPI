require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const router = express.Router();

// Set up the connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');

  // Create the jobs table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      company_id INT,
      type ENUM('job', 'internship') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
  `;
  connection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err.stack);
      return;
    }
    console.log('Table "jobs" created or already exists.');
  });
});

// Fetch all jobs and internships
router.get('/', (req, res) => {
  connection.query('SELECT * FROM jobs', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching jobs' });
    }
    res.json(results);
  });
});

// Fetch a single job by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM jobs WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching the job' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(results[0]);
  });
});

// Create a new job
router.post('/', (req, res) => {
  const { title, description, company_id, type } = req.body;
  const query = 'INSERT INTO jobs (title, description, company_id, type) VALUES (?, ?, ?, ?)';
  connection.query(query, [title, description, company_id, type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating the job' });
    }
    res.status(201).json({ message: 'Job created successfully', jobId: results.insertId });
  });
});

// Update an existing job
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, company_id, type } = req.body;
  const query = 'UPDATE jobs SET title = ?, description = ?, company_id = ?, type = ? WHERE id = ?';
  connection.query(query, [title, description, company_id, type, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating the job' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job updated successfully' });
  });
});

// Delete a job
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM jobs WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting the job' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  });
});

// PATCH: Partially update a job
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Expects an object with fields to update
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const query = `UPDATE jobs SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
  connection.query(query, [...values, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating the job' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job updated successfully' });
  });
});

// HEAD: Check if a job exists
router.head('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT 1 FROM jobs WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).end();
    }
    if (results.length === 0) {
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

// OPTIONS: Provide allowed methods for the jobs endpoint
router.options('/', (req, res) => {
  res.status(200).json({
    allowed_methods: ['GET', 'POST', 'OPTIONS']
  });
});

module.exports = router;
