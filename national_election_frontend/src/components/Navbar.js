import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const role      = localStorage.getItem('role');
  const firstName = localStorage.getItem('first_name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        🗳️ National Election System
      </div>
      <div style={styles.links}>
        {token ? (
          <>
            <Link to="/"          style={styles.link}>Home</Link>
            <Link to="/candidates" style={styles.link}>Candidates</Link>
            <Link to="/results"    style={styles.link}>Live Results</Link>
            <Link to="/vote"       style={styles.link}>Cast Vote</Link>
            {role === 'admin' && (
              <Link to="/admin" style={styles.adminLink}>Admin Dashboard</Link>
            )}
            <span style={styles.welcome}>👤 {firstName}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a3c6e',
    padding: '14px 30px',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '15px'
  },
  adminLink: {
    color: '#FFD700',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  welcome: {
    color: '#a8d8ff',
    fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;