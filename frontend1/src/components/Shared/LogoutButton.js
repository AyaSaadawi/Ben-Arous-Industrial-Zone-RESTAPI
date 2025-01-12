import React from 'react';

const LogoutButton = () => {
  const handleLogout = async () => {
    await fetch('http://localhost:5000/auth/logout', {
      method: 'GET',
      credentials: 'include', // Include cookies for logout
    });
    window.location.href = '/login'; // Redirect to login page after logout
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
