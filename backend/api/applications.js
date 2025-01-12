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

  // Create the applications table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      job_id INT,
      application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );
  `;
  connection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err.stack);
      return;
    }
    console.log('Table "applications" created or already exists.');
  });
});

// Fetch all applications
router.get('/', (req, res) => {
  connection.query('SELECT * FROM applications', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching applications' });
    }
    res.json(results);
  });
});

// Fetch applications by user ID
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  connection.query('SELECT * FROM applications WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching applications for user' });
    }
    res.json(results);
  });
});

// Fetch applications by job ID
router.get('/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  connection.query('SELECT * FROM applications WHERE job_id = ?', [jobId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching applications for job' });
    }
    res.json(results);
  });
});

// Create a new application
router.post('/', (req, res) => {
  const { user_id, job_id } = req.body;
  const query = 'INSERT INTO applications (user_id, job_id) VALUES (?, ?)';
  connection.query(query, [user_id, job_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating application' });
    }
    res.status(201).json({ id: result.insertId, user_id, job_id, status: 'pending' });
  });
});

// Update application status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'accepted', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const query = 'UPDATE applications SET status = ? WHERE id = ?';
  connection.query(query, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating application status' });
    }
    res.json({ message: 'Application status updated successfully' });
  });
});

// Delete an application by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM applications WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting application' });
    }
    res.json({ message: 'Application deleted successfully' });
  });
});

// Fetch applications with status filtering
router.get('/status/:status', (req, res) => {
  const { status } = req.params;
  const validStatuses = ['pending', 'accepted', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const query = 'SELECT * FROM applications WHERE status = ?';
  connection.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching applications by status' });
    }
    res.json(results);
  });
});

// PATCH: Partially update an application
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const query = `UPDATE applications SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
  connection.query(query, [...values, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating the application' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application updated successfully' });
  });
});

// HEAD: Check if an application exists
router.head('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT 1 FROM applications WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).end();
    }
    if (results.length === 0) {
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

// OPTIONS: Provide allowed methods for the applications endpoint
router.options('/', (req, res) => {
  res.status(200).json({
    allowed_methods: ['GET', 'POST', 'OPTIONS']
  });
});

module.exports = router;
