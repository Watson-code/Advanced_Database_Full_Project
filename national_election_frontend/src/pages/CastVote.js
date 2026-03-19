import React, { useState, useEffect } from 'react';
import { getAllCandidates, getElections, castVote, getMyVotes } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CastVote() {
  const [elections,        setElections]        = useState([]);
  const [candidates,       setCandidates]       = useState([]);
  const [myVotes,          setMyVotes]          = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading,          setLoading]          = useState(false);

  useEffect(() => {
    getElections()
      .then(res => {
        const ongoing = (res.data.elections || []).filter(e => e.status === 'ongoing');
        setElections(ongoing);
        // Auto-select if only one ongoing election
        if (ongoing.length === 1) setSelectedElection(String(ongoing[0].id));
      }).catch(() => {});

    getMyVotes()
      .then(res => setMyVotes(res.data.votes || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    getAllCandidates(selectedElection)
      .then(res => setCandidates(res.data.candidates || []))
      .catch(() => {});
  }, [selectedElection]);

  const hasVotedFor = (election_position_id) => {
    return myVotes.some(v => v.election_position_id === election_position_id);
  };

  const handleVote = async (candidate) => {
    if (!window.confirm(
      'Are you sure you want to vote for ' +
      candidate.first_name + ' ' + candidate.last_name +
      ' for ' + candidate.position + '? This cannot be undone.'
    )) return;

    setLoading(true);
    try {
      await castVote({
        candidate_id:         candidate.id,
        election_position_id: candidate.election_position_id
      });
      toast.success('Your vote has been cast successfully!');
      const res = await getMyVotes();
      setMyVotes(res.data.votes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote.');
    } finally {
      setLoading(false);
    }
  };

  const approvedCandidates = candidates.filter(c => c.status === 'approved');

  const grouped = approvedCandidates.reduce((acc, c) => {
    if (!acc[c.position]) acc[c.position] = [];
    acc[c.position].push(c);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <ToastContainer />
      <h2 style={styles.title}>🗳️ Cast Your Vote</h2>

      {elections.length === 0 ? (
        <div style={styles.noElection}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>🗓️ No elections are currently ongoing.</p>
          <p style={{ color: '#aaa', fontSize: '14px' }}>Check back when an election is active.</p>
        </div>
      ) : (
        <>
          {elections.length > 1 && (
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
          )}

          {selectedElection && Object.keys(grouped).length === 0 && (
            <div style={styles.noElection}>
              <p>No approved candidates found for this election.</p>
            </div>
          )}

          {selectedElection && Object.keys(grouped).map(position => (
            <div key={position} style={styles.positionBlock}>
              <h3 style={styles.positionTitle}>{position}</h3>
              <div style={styles.candidateList}>
                {grouped[position].map(candidate => {
                  const voted = hasVotedFor(candidate.election_position_id);
                  return (
                    <div key={candidate.id} style={{
                      ...styles.candidateCard,
                      borderColor: voted ? '#27ae60' : '#eee'
                    }}>
                      <div style={styles.candidateInfo}>
                        <div style={styles.avatarSmall}>
                          {candidate.first_name[0]}{candidate.last_name[0]}
                        </div>
                        <div>
                          <p style={styles.candidateName}>
                            {candidate.first_name} {candidate.last_name}
                          </p>
                          <p style={styles.candidateParty}>
                            {candidate.party || 'Independent'}
                          </p>
                          {candidate.running_mate_first && (
                            <p style={styles.runningMate}>
                              Running Mate: {candidate.running_mate_first} {candidate.running_mate_last}
                            </p>
                          )}
                        </div>
                      </div>
                      {voted ? (
                        <span style={styles.votedBadge}>✅ Voted</span>
                      ) : (
                        <button
                          onClick={() => handleVote(candidate)}
                          style={styles.voteBtn}
                          disabled={loading}
                        >
                          Vote
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const styles = {
  container:      { padding: '30px', maxWidth: '800px', margin: '0 auto' },
  title:          { color: '#1a3c6e', marginBottom: '24px', fontSize: '26px' },
  noElection:     { textAlign: 'center', color: '#888', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  filterBar:      { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
  filterLabel:    { fontWeight: 'bold', color: '#444', fontSize: '14px' },
  select:         { padding: '8px 14px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px' },
  positionBlock:  { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  positionTitle:  { color: '#1a3c6e', marginBottom: '16px', fontSize: '18px', borderBottom: '2px solid #e8f0fe', paddingBottom: '10px' },
  candidateList:  { display: 'flex', flexDirection: 'column', gap: '12px' },
  candidateCard:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '2px solid #eee', backgroundColor: '#fafafa' },
  candidateInfo:  { display: 'flex', alignItems: 'center', gap: '14px' },
  avatarSmall:    { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1a3c6e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', flexShrink: 0 },
  candidateName:  { fontWeight: 'bold', color: '#333', margin: 0, fontSize: '15px' },
  candidateParty: { color: '#e67e22', margin: 0, fontSize: '13px' },
  runningMate:    { color: '#888', margin: '2px 0 0', fontSize: '12px' },
  voteBtn:        { backgroundColor: '#1a3c6e', color: '#fff', border: 'none', padding: '8px 22px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  votedBadge:     { color: '#27ae60', fontWeight: 'bold', fontSize: '14px' }
};

export default CastVote;