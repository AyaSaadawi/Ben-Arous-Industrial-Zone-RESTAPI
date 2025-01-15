const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); 
const cors = require('cors'); 
const { OAuth2Client } = require('google-auth-library'); 
const mysql = require('mysql2/promise');

// Swagger dependencies
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.json'); 

dotenv.config(); 


const companiesRoute = require('./api/companies');
const jobsRoute = require('./api/jobs');
const usersRoute = require('./api/users');
const applicationsRoute = require('./api/applications');
const authRoute = require('./api/auth');


const app = express();
const port = 5000;


const SECRET_KEY = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID; 

// Set up the connection with promise support
const connection = mysql.createPool({
  host: process.env.DB_HOST,    
  user: process.env.DB_USER,   
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_NAME   
});

// Enable CORS for the frontend added
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));


// Middleware to handle sessions and cookies
app.use(cookieParser()); 
app.use(express.json()); 


// Secure session cookie configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Important for security to prevent client-side access to cookies
      maxAge: 3600000, 
      secure: false
    },
  })
);


app.use(bodyParser.json());


// Set COOP and COEP headers to resolve cross-origin issues
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});


// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header


  if (!token) {
    return res.sendStatus(403).send('Access denied: No token provided'); // Forbidden if no token is provided
  }


  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden', details: err.message });
    }
    req.user = user; // Attach the user info to the request
    next();
  });
}


// Route for login - Generates JWT Token
app.post('/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await connection.query('SELECT * FROM google_users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ userId: user.google_id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({ token });
    } else {
      return res.status(401).send('User not found');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});


// Route for token refresh
app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;


  if (!refreshToken) return res.sendStatus(401); // Unauthorized if no refresh token


  jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if refresh token is invalid
    const newAccessToken = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ accessToken: newAccessToken });
  });
});


// Protected Routes (Require JWT Authentication)
app.use('/companies', authenticateJWT, companiesRoute);
app.use('/jobs', authenticateJWT, jobsRoute);
app.use('/users', authenticateJWT, usersRoute);
app.use('/applications', authenticateJWT, applicationsRoute);
app.use('/auth', authRoute);

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});


// Route: Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('token'); // Ensure the JWT cookie is cleared on logout
    res.send('Logged out');
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
