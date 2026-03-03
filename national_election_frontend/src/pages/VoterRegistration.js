import React, { useState, useEffect } from 'react';
import { registerVoter, getVoterStatus, getPollingStations } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VoterRegistration() {
  const [status,   setStatus]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({ polling_station_id: '' });

  useEffect(() => {
    getVoterStatus()
      .then(res => setStatus(res.data))
      .catch(() => {});
    getPollingStations()
      .then(res => setStations(res.data.stations || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.polling_station_id) {
      toast.error('Please select a polling station.');
      return;
    }
    setLoading(true);
    try {
      await registerVoter(form);
      toast.success('Voter registration submitted! Awaiting verification.');
      const res = await getVoterStatus();
      setStatus(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.card}>
        <h2 style={styles.title}>🗳️ Voter Registration</h2>

        {status?.registered ? (
          <div style={styles.statusBox}>
            <h3 style={styles.statusTitle}>Your Voter Status</h3>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Registration Number:</span>
              <span style={styles.statusValue}>
                {status.voter.voter_registration_number}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Polling Station:</span>
              <span style={styles.statusValue}>
                {status.voter.polling_station || 'Not assigned'}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Verified:</span>
              <span style={{
                ...styles.statusValue,
                color: status.voter.is_verified ? '#27ae60' : '#e67e22',
                fontWeight: 'bold'
              }}>
                {status.voter.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Registered On:</span>
              <span style={styles.statusValue}>
                {new Date(status.voter.registration_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={styles.info}>
              Register as a voter to participate in national elections.
              You must be 18 years or older.
            </p>
            <div style={styles.field}>
              <label style={styles.label}>Select Polling Station</label>
              {stations.length === 0 ? (
                <p style={styles.noStations}>Loading polling stations...</p>
              ) : (
                <select
                  value={form.polling_station_id}
                  onChange={(e) => setForm({ polling_station_id: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select your polling station --</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.location_address}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Register as Voter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
  title: { textAlign: 'center', color: '#1a3c6e', marginBottom: '24px', fontSize: '24px' },
  info: { color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' },
  noStations: { color: '#888', fontSize: '13px', fontStyle: 'italic' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#1a3c6e', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' },
  btnDisabled: { width: '100%', padding: '12px', backgroundColor: '#aaa', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '16px', cursor: 'not-allowed' },
  statusBox: { backgroundColor: '#f8f9ff', borderRadius: '10px', padding: '24px', border: '1px solid #dde' },
  statusTitle: { color: '#1a3c6e', marginBottom: '16px', fontSize: '18px' },
  statusRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' },
  statusLabel: { color: '#666', fontWeight: 'bold' },
  statusValue: { color: '#333' }
};

export default VoterRegistration;