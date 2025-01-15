import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Header from './components/Shared/Header';
import Apis from './components/Auth/Apis';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/header" element={<Header />} />
        <Route path="/apis" element={<Apis />} />
      </Routes>
    </Router>
  );
}

export default App;
