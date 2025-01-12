require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const router = express.Router();

// Email validation regex pattern
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

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
    return;
  }
  console.log('Connected to the database.');

  // Create the users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user', 'guest') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  connection.query(createTableQuery, (err, result) => {
    if (err) {
      return;
    }
    console.log('Table "users" created or already exists.');
  });
});

// Email validation middleware
function validateEmail(email) {
  return emailRegex.test(email);
}

// Fetch all users
router.get('/', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' });
    }
    res.json(results);
  });
});

// Fetch a single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Create a new user
router.post('/', (req, res) => {
  const { username, email, password, role } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  connection.query(query, [username, email, password, role || 'user'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.status(201).json({ id: result.insertId, username, email, role: role || 'user' });
  });
});

// Update a user by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = `
    UPDATE users 
    SET username = ?, email = ?, password = ?, role = ? 
    WHERE id = ?
  `;
  connection.query(query, [username, email, password, role, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating user' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Delete a user by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get all jobs a user applied for
router.get('/:id/jobs', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT jobs.* 
    FROM jobs 
    INNER JOIN applications ON jobs.id = applications.job_id 
    WHERE applications.user_id = ?
  `;
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user applications' });
    }
    res.json(results);
  });
});

// Create a new application (user applies for a job)
router.post('/:id/apply', (req, res) => {
  const { id } = req.params; // user_id
  const { job_id } = req.body;
  const query = 'INSERT INTO applications (user_id, job_id) VALUES (?, ?)';
  connection.query(query, [id, job_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error applying for job' });
    }
    res.status(201).json({ message: 'Application submitted successfully' });
  });
});

// PATCH: Partially update a user
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  if (updates.email && !validateEmail(updates.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = `UPDATE users SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
  connection.query(query, [...values, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating the user' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// HEAD: Check if a user exists
router.head('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT 1 FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).end();
    }
    if (results.length === 0) {
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

// OPTIONS: Provide allowed methods for the users endpoint
router.options('/', (req, res) => {
  res.status(200).json({
    allowed_methods: ['GET', 'POST', 'OPTIONS']
  });
});

module.exports = router;
