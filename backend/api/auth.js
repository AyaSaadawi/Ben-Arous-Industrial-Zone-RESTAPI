const { google } = require('googleapis');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();


const connection = mysql.createPool({
  host: process.env.DB_HOST,    
  user: process.env.DB_USER,   
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_NAME,
});

(async () => {
  try {
    const conn = await connection.getConnection();
    console.log('Connected to the database.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS google_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await conn.query(createTableQuery);
    console.log('Table "google_users" created or already exists.');
    conn.release();
  } catch (err) {
    console.error('Error connecting to the database or creating table:', err.stack);
  }
})();


const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid', 
];


// Generate Auth URL
function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}


// Route: Login with Google
router.get('/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});


// Route: OAuth2 Callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const { id, email, name } = userInfo.data;

    // Insert or update the user in the database
    await connection.query(
      `INSERT INTO google_users (google_id, email, name) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name)`,
      [id, email, name]
    );

    // Create JWT token (ID token) for user session
    const payload = { userId: id, email, name };

    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });


    // Store the JWT in a secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set secure cookies in production
      maxAge: 3600000, 
      sameSite: 'None', 
    });
  
    res.redirect('http://localhost:3000/dashboard');
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).send('Authentication failed');
  }
});


// Route: Protect API Endpoints
router.get('/protected', (req, res) => {
  const token = req.cookies.token;


  if (!token) {
    return res.status(401).send('Access denied, no token provided');
  }


  try {
    // Validate JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // Proceed with the request if the token is valid
    res.send(`Welcome back, ${decoded.name}!`);
  } catch (err) {
    console.error('Invalid or expired token:', err);
    res.status(401).send('Invalid or expired token');
   }
});


// Route: Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the JWT token cookie
  res.send('Logged out');
});

module.exports = router;
