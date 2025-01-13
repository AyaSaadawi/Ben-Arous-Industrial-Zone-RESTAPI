# Ben-Arous-Industrial-Zone-RESTAPI

## Industrial Zone Ben Arous Web Service

This project is a comprehensive web service designed for the Industrial Zone of Ben Arous in Tunisia. It facilitates the representation of companies, job/internship offers, and enables users to apply for jobs through a secure and efficient platform.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Frontend](#frontend)
- [Backend](#backend)
- [Security](#security)
- [Dockerization](#dockerization)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

## Features

- **Company Management**: View and manage company profiles.
- **Job Offers**: Browse and manage job listings.
- **User Management**: User registration, authentication, and profile management.
- **Job Applications**: Users can apply for jobs, and companies can manage applications.
- **Secure Authentication**: Utilizes OAuth 2.0 and OpenID Connect (OIDC) for secure login.
- **REST API**: A robust API for interacting with the platform.
- **Swagger Documentation**: Comprehensive API documentation using Swagger.

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **React Router**: For managing navigation and routing.
- **HTML & CSS**: For basic structure and styling of the application.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for building REST APIs.
- **MySQL**: Relational database for storing data.
- **JWT (JSON Web Token)**: Secure token-based authentication.
- **OAuth 2.0 & OIDC**: Secure and scalable authentication and authorization.
- **Google Auth Library**: For OAuth 2.0 and Google sign-in integration.
- **Swagger**: API documentation and testing interface.

### Other Tools
- **dotenv**: To manage environment variables.
- **cors**: Handling Cross-Origin Resource Sharing.
- **cookie-parser & express-session**: For managing cookies and sessions.
- **body-parser**: Parsing incoming request bodies.

## Setup and Installation

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AyaSaadawi/Ben-Arous-Industrial-Zone-RESTAPI
   ```
2. **Navigate to the backend directory**:
   ```bash
   cd ./backend
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Set Up Environment Variables**:
   Create a `.env` file in the backend directory and configure the following variables:
   ```
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   JWT_SECRET=your-jwt-secret
   CLIENT_ID=your-google-client-id
   CLIENT_SECRET=your-client-secret
   REDIRECT_URI=your-redirect-uri
   ```
5. **Run the Server**:
   ```bash
   node app.js
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd ../frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run the Frontend**:
   ```bash
   npm start
   ```

## Frontend

The frontend of the application is built using React. It consists of the following components:

- **Login Component**: Handles user authentication.
- **Dashboard Component**: Displays an introduction to the industrial zone, its map using google maps public APIs, a link to the swagger documentation to interact with all RESTAPIs created.
- **Header Component**: A shared header across different pages for navigation.

### Frontend Code Structure

Here is the basic structure of the `App.js` file in the frontend:

```javascript
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Header from './components/Shared/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
```

## Security

The web service incorporates various security features:

- **JWT Authentication**: Secure token-based user authentication.
- **OAuth 2.0 and OIDC**: For secure and standardized user authentication.
- **Session Management**: Secure handling of user sessions with `express-session`.
- **Cross-Origin Resource Sharing (CORS)**: Configured to allow frontend interaction.
- **Secure Cookie Handling**: Cookies are marked `httpOnly` to prevent client-side access.

## Dockerization

Both the frontend and backend are Dockerized for easy deployment and scalability.

### Dockerizing Backend

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["node", "app.js"]
```

### Dockerizing Frontend

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:20 as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Create a `docker-compose.yml` file to manage both frontend and backend:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "3307:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend
    container_name: backend
    ports:
      - "5000:5000"
    env_file:
      - ./.env
    environment:
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - CLIENT_ID=${CLIENT_ID}
      - CLIENT_SECRET=${CLIENT_SECRET}
      - REDIRECT_URI=${REDIRECT_URI}
      - JWT_SECRET=${JWT_SECRET}

  frontend:
    build:
      context: ./frontend1
    container_name: frontend1
    ports:
      - "3000:3000"

volumes:
  mysql-data:
```

## Deployment

The frontend is deployed using Render cloud provider: https://ben-arous-industrial-zone-api.onrender.com/.

## API Documentation

Swagger is used for API documentation and can be accessed at:

```bash
http://localhost:5000/api-docs
```

Explore the available endpoints and interact with the API directly through the Swagger UI.
