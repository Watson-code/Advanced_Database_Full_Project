import React, { useState, useEffect } from 'react';
import { getLiveResults, getAllElections } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function LiveResults() {
  const [elections, setElections]   = useState([]);
  const [results,   setResults]     = useState({});
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    getAllElections()
      .then(res => setElections(res.data.elections || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    setLoading(true);
    getLiveResults(selectedElection)
      .then(res => {
        setResults(res.data.results || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      getLiveResults(selectedElection)
        .then(res => setResults(res.data.results || {}))
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedElection]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Live Election Results</h2>
      <p style={styles.subtitle}>Results refresh every 15 seconds</p>

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Select Election:</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Select an election --</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {loading && <p style={styles.loading}>Loading results...</p>}

      {!loading && selectedElection && Object.keys(results).length === 0 && (
        <p style={styles.empty}>No results available yet.</p>
      )}

      {Object.keys(results).map(position => {
        const data = results[position].map(r => ({
          name: r.candidate_name,
          votes: parseInt(r.vote_count),
          party: r.party_abbr || 'IND'
        }));

        const winner = data.reduce((a, b) => a.votes > b.votes ? a : b, data[0]);

        return (
          <div key={position} style={styles.positionBlock}>
            <h3 style={styles.positionTitle}>{position}</h3>
            {winner && winner.votes > 0 && (
              <div style={styles.leadingBanner}>
                🏆 Leading: {winner.name} ({winner.party}) — {winner.votes} votes
              </div>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#1a3c6e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Candidate</span>
                <span>Party</span>
                <span>Votes</span>
              </div>
              {results[position].map((r, i) => (
                <div key={i} style={{
                  ...styles.tableRow,
                  backgroundColor: i === 0 ? '#f0f7ff' : '#fff'
                }}>
                  <span style={styles.candidateName}>
                    {i === 0 && '🏆 '}{r.candidate_name}
                  </span>
                  <span style={styles.party}>
                    {r.party || 'Independent'}
                  </span>
                  <span style={styles.votes}>{r.vote_count}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#1a3c6e', marginBottom: '6px', fontSize: '26px' },
  subtitle: { color: '#888', fontSize: '13px', marginBottom: '24px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
  filterLabel: { fontWeight: 'bold', color: '#444', fontSize: '14px' },
  select: { padding: '8px 14px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px' },
  loading: { textAlign: 'center', color: '#888' },
  empty: { textAlign: 'center', color: '#888', padding: '40px' },
  positionBlock: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  positionTitle: { color: '#1a3c6e', marginBottom: '12px', fontSize: '20px' },
  leadingBanner: { backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '14px', color: '#f57f17' },
  table: { marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', backgroundColor: '#1a3c6e', color: '#fff', fontSize: '13px', fontWeight: 'bold' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: '14px' },
  candidateName: { color: '#333', fontWeight: '500' },
  party: { color: '#e67e22' },
  votes: { color: '#1a3c6e', fontWeight: 'bold' }
};

export default LiveResults;