import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVoterStatus } from '../services/api';

function Home() {
  const role      = localStorage.getItem('role');
  const firstName = localStorage.getItem('first_name');
  const [voterStatus, setVoterStatus] = useState(null);

  useEffect(() => {
    getVoterStatus()
      .then(res => setVoterStatus(res.data))
      .catch(() => {});
  }, []);

  const isAdmin    = role === 'admin';
  const registered = voterStatus?.registered;
  const verified   = voterStatus?.voter?.is_verified;

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🗳️ National Election System</h1>
        <p style={styles.heroSub}>Welcome back, {firstName}!</p>
      </div>

      {/* Voter Status Banner */}
      {!isAdmin && (
        <div style={{
          ...styles.banner,
          backgroundColor: verified ? '#eafaf1' : registered ? '#fff8e1' : '#fdecea',
          borderColor:     verified ? '#27ae60' : registered ? '#f39c12' : '#e74c3c'
        }}>
          {verified
            ? '✅ You are a verified voter. You can cast your vote!'
            : registered
            ? '⏳ Your voter registration is pending admin verification.'
            : '❌ You are not registered as a voter yet. Register below to participate.'}
        </div>
      )}

      <div style={styles.grid}>

        {/* Register as Voter */}
        {!isAdmin && !registered && (
          <Link to="/voter-registration" style={styles.card}>
            <div style={styles.icon}>📋</div>
            <h3 style={styles.cardTitle}>Register as Voter</h3>
            <p style={styles.cardDesc}>Submit your voter registration to participate in elections.</p>
          </Link>
        )}

        {/* Voter Registration Status */}
        {!isAdmin && registered && (
          <Link to="/voter-registration" style={styles.card}>
            <div style={styles.icon}>🪪</div>
            <h3 style={styles.cardTitle}>My Voter Status</h3>
            <p style={styles.cardDesc}>
              {verified ? 'View your verified voter details.' : 'Check your pending verification status.'}
            </p>
          </Link>
        )}

        {/* Cast Vote */}
        {!isAdmin && (
          <Link to="/vote" style={{
            ...styles.card,
            opacity: verified ? 1 : 0.5,
            pointerEvents: verified ? 'auto' : 'none'
          }}>
            <div style={styles.icon}>🗳️</div>
            <h3 style={styles.cardTitle}>Cast Your Vote</h3>
            <p style={styles.cardDesc}>
              {verified ? 'Vote in ongoing elections.' : 'You must be verified to vote.'}
            </p>
          </Link>
        )}

        {/* Candidates */}
        <Link to="/candidates" style={styles.card}>
          <div style={styles.icon}>👤</div>
          <h3 style={styles.cardTitle}>View Candidates</h3>
          <p style={styles.cardDesc}>Browse all approved candidates running in elections.</p>
        </Link>

        {/* Live Results */}
        <Link to="/results" style={styles.card}>
          <div style={styles.icon}>📊</div>
          <h3 style={styles.cardTitle}>Live Results</h3>
          <p style={styles.cardDesc}>Track real-time election results as votes come in.</p>
        </Link>

        {/* Admin Dashboard */}
        {isAdmin && (
          <Link to="/admin" style={{ ...styles.card, borderColor: '#FFD700' }}>
            <div style={styles.icon}>🛠️</div>
            <h3 style={styles.cardTitle}>Admin Dashboard</h3>
            <p style={styles.cardDesc}>Manage voters, candidates, elections, and more.</p>
          </Link>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '24px' },
  heroTitle: { color: '#1a3c6e', fontSize: '32px', marginBottom: '8px' },
  heroSub: { color: '#666', fontSize: '16px' },
  banner: {
    padding: '14px 20px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '28px',
    fontSize: '15px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '28px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    border: '2px solid #eee',
    transition: 'transform 0.15s',
    display: 'block',
    cursor: 'pointer'
  },
  icon: { fontSize: '36px', marginBottom: '12px' },
  cardTitle: { color: '#1a3c6e', fontSize: '17px', marginBottom: '8px' },
  cardDesc: { color: '#666', fontSize: '13px', lineHeight: '1.5' }
};

export default Home;