import React from 'react';
import '../../App.css';
import googleLogo from '../../google-logo.jpg';

const LoginPage = () => {
  // Redirect to Google login on button click
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google'; 
  };

  return (
    <div className="login-container">
      <h2>Login Page</h2>
      <button className="google-btn" onClick={handleGoogleLogin}>
        <img src={googleLogo} alt="Google Logo" />
        Sign Up with Google
      </button>
    </div>
  );
};

export default LoginPage;
