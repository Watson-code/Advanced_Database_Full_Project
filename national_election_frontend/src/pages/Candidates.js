import React, { useState, useEffect } from 'react';
import { getAllCandidates, getElections } from '../services/api';

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections,  setElections]  = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElections()
      .then(res => setElections(res.data.elections || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getAllCandidates(selectedElection)
      .then(res => {
        setCandidates(res.data.candidates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedElection]);

  const approved = candidates.filter(c => c.status === 'approved');

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🙋 Candidates</h2>

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filter by Election:</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          style={styles.select}
        >
          <option value="">All Elections</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading candidates...</p>
      ) : approved.length === 0 ? (
        <p style={styles.empty}>No approved candidates found.</p>
      ) : (
        <div style={styles.grid}>
          {approved.map(candidate => (
            <div key={candidate.id} style={styles.card}>
              <div style={styles.avatar}>
                {candidate.photo_url ? (
                  <img src={candidate.photo_url} alt={candidate.first_name}
                    style={styles.photo} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {candidate.first_name[0]}{candidate.last_name[0]}
                  </div>
                )}
              </div>
              <h3 style={styles.name}>
                {candidate.first_name} {candidate.last_name}
              </h3>
              <span style={styles.position}>{candidate.position}</span>
              <span style={styles.party}>
                {candidate.party || 'Independent'}
                {candidate.party_abbr ? ' (' + candidate.party_abbr + ')' : ''}
              </span>
              {candidate.running_mate_first && (
                <p style={styles.runningMate}>
                  Running Mate: {candidate.running_mate_first} {candidate.running_mate_last}
                </p>
              )}
              <p style={styles.election}>{candidate.election}</p>
              {candidate.platform && (
                <p style={styles.platform}>{candidate.platform}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1100px', margin: '0 auto' },
  title: { color: '#1a3c6e', marginBottom: '20px', fontSize: '26px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
  filterLabel: { fontWeight: 'bold', color: '#444', fontSize: '14px' },
  select: { padding: '8px 14px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px' },
  loading: { color: '#888', textAlign: 'center', marginTop: '40px' },
  empty: { color: '#888', textAlign: 'center', marginTop: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center', border: '1px solid #eee' },
  avatar: { marginBottom: '14px' },
  photo: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#1a3c6e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto' },
  name: { color: '#1a3c6e', fontSize: '18px', marginBottom: '6px' },
  position: { display: 'block', backgroundColor: '#e8f0fe', color: '#1a3c6e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginBottom: '8px' },
  party: { display: 'block', color: '#e67e22', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' },
  runningMate: { color: '#666', fontSize: '12px', marginBottom: '6px' },
  election: { color: '#888', fontSize: '12px', marginBottom: '10px' },
  platform: { color: '#555', fontSize: '13px', lineHeight: '1.5', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px' }
};

export default Candidates;