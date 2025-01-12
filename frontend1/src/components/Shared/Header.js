import React from 'react';
import axios from 'axios';
import '../../App.css';
import logo from '../../my-logo.png';


function Header() {
  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, { withCredentials: true });
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="title">Ben Arous Industrial Gateway</h1>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </header>
  );
}

export default Header;
