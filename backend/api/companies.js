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

  // Create the companies table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sector VARCHAR(255),
      contact_info JSON, 
      address VARCHAR(255),
      services JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  connection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err.stack);
      return;
    }
    console.log('Table "companies" created or already exists.');
  });
});

// GET all companies
router.get('/', (req, res) => {
  connection.query('SELECT * FROM companies', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching companies', details: err.message });
    }
    res.json(results);
  });
});

// GET a single company
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM companies WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching company', details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(results[0]);
  });
});

// CREATE a company
router.post('/', (req, res) => {
  const { name, address, sector, contact_info, services } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  connection.query(
    'INSERT INTO companies (name, address, sector, contact_info, services) VALUES (?, ?, ?, ?, ?)', 
    [name, address, sector || null, JSON.stringify(contact_info || {}), JSON.stringify(services || {})], 
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating company', details: err.message });
      }
      res.json({ id: results.insertId, message: 'Company created successfully' });
    }
  );
});

// UPDATE a company
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, sector, contact_info, services } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  connection.query(
    'UPDATE companies SET name = ?, address = ?, sector = ?, contact_info = ?, services = ? WHERE id = ?',
    [name, address, sector || null, JSON.stringify(contact_info || {}), JSON.stringify(services || {}), id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating company', details: err.message });
      }
      res.json({ message: 'Company updated successfully' });
    }
  );
});

// DELETE a company
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM companies WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting company', details: err.message });
    }
    res.json({ message: 'Company deleted successfully' });
  });
});

// PATCH a company
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }
  
  // Ensure the services field is correctly formatted as a JSON string
  if (updates.services) {
    updates.services = JSON.stringify(updates.services);
  }
  
  const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = Object.values(updates);

  connection.query(`UPDATE companies SET ${fields} WHERE id = ?`, [...values, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error partially updating company', details: err.message });
    }
    res.json({ message: 'Company partially updated successfully' });
  });
});

// HEAD request to check if a company exists
router.head('/:id', (req, res) => {
  const { id } = req.params;

  connection.query('SELECT 1 FROM companies WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking if company exists', details: err.message });
    }

    if (results.length > 0) {
      res.status(200).send(); 
    } else {
      res.status(404).send(); 
    }
  });
});

// OPTIONS request to list allowed methods for the collection
router.options('/', (req, res) => {
  console.log('OPTIONS /companies called');
  res.status(200).json({
    allowed_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  });
});

// OPTIONS request to list allowed methods for a specific company
router.options('/:id', (req, res) => {
  console.log('OPTIONS /companies called');
  res.status(200).json({
    allowed_methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  });
});


module.exports = router;
