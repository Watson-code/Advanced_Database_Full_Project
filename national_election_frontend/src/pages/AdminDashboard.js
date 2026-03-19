import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllElections, createElection,
         updateElectionStatus, getAllVoters, verifyVoter,
         getAuditLogs, getAllParties, createParty,
         getAllCandidates, updateCandidate,
         getElectionPositions, getAllCitizens,
         adminRegisterCandidate } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [stats,      setStats]      = useState(null);
  const [elections,  setElections]  = useState([]);
  const [voters,     setVoters]     = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [parties,    setParties]    = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [positions,  setPositions]  = useState([]);
  const [citizens,   setCitizens]   = useState([]);
  const [citizenSearch, setCitizenSearch] = useState('');
  const [tab, setTab] = useState('overview');

  const [electionForm, setElectionForm] = useState({
    title: '', description: '', election_type: 'general',
    start_date: '', end_date: ''
  });
  const [partyForm, setPartyForm] = useState({
    name: '', abbreviation: '', founded_date: ''
  });
  const [candidateForm, setCandidateForm] = useState({
    citizen_id: '', election_id: '', election_position_id: '',
    party_id: '', platform: '', photo_url: '', running_mate_id: ''
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    getAdminStats().then(r => setStats(r.data.stats)).catch(() => {});
    getAllElections().then(r => setElections(r.data.elections || [])).catch(() => {});
    getAllVoters().then(r => setVoters(r.data.voters || [])).catch(() => {});
    getAuditLogs().then(r => setLogs(r.data.logs || [])).catch(() => {});
    getAllParties().then(r => setParties(r.data.parties || [])).catch(() => {});
    getAllCandidates().then(r => setCandidates(r.data.candidates || [])).catch(() => {});
    getAllCitizens().then(r => setCitizens(r.data.citizens || [])).catch(() => {});
  };

  useEffect(() => {
    if (!candidateForm.election_id) { setPositions([]); return; }
    getElectionPositions(candidateForm.election_id)
      .then(r => setPositions(r.data.positions || []))
      .catch(() => {});
  }, [candidateForm.election_id]);

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await createElection(electionForm);
      toast.success('Election created!');
      setElectionForm({ title: '', description: '', election_type: 'general', start_date: '', end_date: '' });
      getAllElections().then(r => setElections(r.data.elections || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateElectionStatus(id, { status });
      toast.success('Election status updated!');
      getAllElections().then(r => setElections(r.data.elections || []));
      getAdminStats().then(r => setStats(r.data.stats));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleVerifyVoter = async (id) => {
    try {
      await verifyVoter(id);
      toast.success('Voter verified!');
      getAllVoters().then(r => setVoters(r.data.voters || []));
      getAdminStats().then(r => setStats(r.data.stats));
    } catch (err) {
      toast.error('Failed to verify voter.');
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      await createParty(partyForm);
      toast.success('Party created!');
      setPartyForm({ name: '', abbreviation: '', founded_date: '' });
      getAllParties().then(r => setParties(r.data.parties || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create party.');
    }
  };

  const handleCandidateStatus = async (id, status) => {
    try {
      await updateCandidate(id, { status });
      toast.success(`Candidate ${status}!`);
      getAllCandidates().then(r => setCandidates(r.data.candidates || []));
      getAdminStats().then(r => setStats(r.data.stats));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update candidate.');
    }
  };

  const handleRegisterCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.citizen_id) {
      toast.error('Please select a citizen.'); return;
    }
    if (!candidateForm.election_position_id) {
      toast.error('Please select a position.'); return;
    }
    try {
      await adminRegisterCandidate({
        citizen_id:           parseInt(candidateForm.citizen_id),
        election_position_id: parseInt(candidateForm.election_position_id),
        party_id:             candidateForm.party_id || null,
        platform:             candidateForm.platform || null,
        photo_url:            candidateForm.photo_url || null,
        running_mate_id:      candidateForm.running_mate_id || null,
      });
      toast.success('Candidate registered and approved!');
      setCandidateForm({
        citizen_id: '', election_id: '', election_position_id: '',
        party_id: '', platform: '', photo_url: '', running_mate_id: ''
      });
      setCitizenSearch('');
      getAllCandidates().then(r => setCandidates(r.data.candidates || []));
      getAdminStats().then(r => setStats(r.data.stats));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register candidate.');
    }
  };

  const filteredCitizens = citizens.filter(c =>
    citizenSearch.length >= 2 && (
      c.first_name?.toLowerCase().includes(citizenSearch.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(citizenSearch.toLowerCase()) ||
      c.national_id?.toLowerCase().includes(citizenSearch.toLowerCase())
    )
  );

  const statusColor = (s) => ({
    approved: '#2ecc71', pending: '#f39c12',
    rejected: '#e74c3c', disqualified: '#c0392b', withdrawn: '#95a5a6'
  }[s] || '#aaa');

  const statCards = stats ? [
    { label: 'Total Citizens',    value: stats.total_citizens,          color: '#3498db' },
    { label: 'Registered Voters', value: stats.total_registered_voters, color: '#2ecc71' },
    { label: 'Candidates',        value: stats.total_candidates,        color: '#e67e22' },
    { label: 'Elections',         value: stats.total_elections,         color: '#9b59b6' },
    { label: 'Votes Cast',        value: stats.total_votes_cast,        color: '#1a3c6e' },
    { label: 'Pending Approvals', value: stats.pending_candidates,      color: '#e74c3c' },
    { label: 'Unverified Voters', value: stats.unverified_voters,       color: '#f39c12' },
    { label: 'Parties',           value: stats.total_parties,           color: '#1abc9c' },
  ] : [];

  const tabs = ['overview', 'elections', 'candidates', 'voters', 'parties', 'logs'];

  return (
    <div style={styles.container}>
      <ToastContainer />
      <h2 style={styles.title}>⚙️ Admin Dashboard</h2>

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={tab === t ? styles.activeTab : styles.tab}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'candidates' && stats?.pending_candidates > 0 && (
              <span style={styles.tabBadge}>{stats.pending_candidates}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div style={styles.grid}>
          {statCards.map((s, i) => (
            <div key={i} style={{ ...styles.statCard, borderTop: '4px solid ' + s.color }}>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ELECTIONS */}
      {tab === 'elections' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Election</h3>
            <form onSubmit={handleCreateElection}>
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Title</label>
                  <input value={electionForm.title} style={styles.input}
                    onChange={e => setElectionForm({...electionForm, title: e.target.value})}
                    placeholder="Election title" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select value={electionForm.election_type} style={styles.input}
                    onChange={e => setElectionForm({...electionForm, election_type: e.target.value})}>
                    <option value="general">General</option>
                    <option value="by-election">By-Election</option>
                    <option value="referendum">Referendum</option>
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <input value={electionForm.description} style={styles.input}
                  onChange={e => setElectionForm({...electionForm, description: e.target.value})}
                  placeholder="Description" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Start Date</label>
                  <input type="datetime-local" value={electionForm.start_date}
                    style={styles.input} required
                    onChange={e => setElectionForm({...electionForm, start_date: e.target.value})} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>End Date</label>
                  <input type="datetime-local" value={electionForm.end_date}
                    style={styles.input} required
                    onChange={e => setElectionForm({...electionForm, end_date: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={styles.btn}>Create Election</button>
            </form>
          </div>

          <h3 style={styles.sectionTitle}>All Elections</h3>
          {elections.map(e => (
            <div key={e.id} style={styles.rowCard}>
              <div>
                <p style={styles.rowTitle}>{e.title}</p>
                <p style={styles.rowSub}>{e.election_type} · {new Date(e.start_date).toLocaleDateString()} → {new Date(e.end_date).toLocaleDateString()}</p>
              </div>
              <div style={styles.rowActions}>
                <span style={{...styles.statusBadge, backgroundColor:
                  e.status === 'ongoing' ? '#2ecc71' :
                  e.status === 'completed' ? '#95a5a6' :
                  e.status === 'cancelled' ? '#e74c3c' : '#f39c12'}}>
                  {e.status}
                </span>
                {e.status === 'upcoming' && (
                  <button style={styles.actionBtn}
                    onClick={() => handleUpdateStatus(e.id, 'ongoing')}>Start</button>
                )}
                {e.status === 'ongoing' && (
                  <button style={{...styles.actionBtn, backgroundColor: '#e74c3c'}}
                    onClick={() => handleUpdateStatus(e.id, 'completed')}>End</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANDIDATES */}
      {tab === 'candidates' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ Register a Candidate</h3>
            <form onSubmit={handleRegisterCandidate}>

              <div style={styles.field}>
                <label style={styles.label}>Search Citizen (name or National ID)</label>
                <input
                  value={citizenSearch}
                  onChange={e => {
                    setCitizenSearch(e.target.value);
                    setCandidateForm(f => ({ ...f, citizen_id: '' }));
                  }}
                  style={styles.input}
                  placeholder="Type at least 2 characters..."
                />
                {filteredCitizens.length > 0 && !candidateForm.citizen_id && (
                  <div style={styles.dropdown}>
                    {filteredCitizens.map(c => (
                      <div key={c.id} style={styles.dropdownItem}
                        onClick={() => {
                          setCandidateForm(f => ({ ...f, citizen_id: c.id }));
                          setCitizenSearch(c.first_name + ' ' + c.last_name + ' (' + c.national_id + ')');
                        }}>
                        {c.first_name} {c.last_name} — {c.national_id}
                      </div>
                    ))}
                  </div>
                )}
                {candidateForm.citizen_id && (
                  <span style={styles.selectedBadge}>✅ Citizen selected (ID: {candidateForm.citizen_id})</span>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Election</label>
                  <select value={candidateForm.election_id} style={styles.input} required
                    onChange={e => setCandidateForm(f => ({
                      ...f, election_id: e.target.value, election_position_id: ''
                    }))}>
                    <option value="">-- Select election --</option>
                    {elections.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Position</label>
                  <select value={candidateForm.election_position_id} style={styles.input} required
                    disabled={!candidateForm.election_id}
                    onChange={e => setCandidateForm(f => ({ ...f, election_position_id: e.target.value }))}>
                    <option value="">-- Select position --</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.position_title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Political Party</label>
                <select value={candidateForm.party_id} style={styles.input}
                  onChange={e => setCandidateForm(f => ({ ...f, party_id: e.target.value }))}>
                  <option value="">Independent (No Party)</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.abbreviation})</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Campaign Platform</label>
                <textarea value={candidateForm.platform} style={styles.textarea} rows={3}
                  placeholder="Candidate's campaign platform..."
                  onChange={e => setCandidateForm(f => ({ ...f, platform: e.target.value }))} />
              </div>

              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Photo URL (optional)</label>
                  <input value={candidateForm.photo_url} style={styles.input}
                    placeholder="https://..."
                    onChange={e => setCandidateForm(f => ({ ...f, photo_url: e.target.value }))} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Running Mate Citizen ID (optional)</label>
                  <input value={candidateForm.running_mate_id} style={styles.input}
                    placeholder="Citizen ID"
                    onChange={e => /^\d*$/.test(e.target.value) &&
                      setCandidateForm(f => ({ ...f, running_mate_id: e.target.value }))} />
                </div>
              </div>

              <button type="submit" style={styles.btn}>✅ Register Candidate</button>
            </form>
          </div>

          <h3 style={styles.sectionTitle}>All Candidates ({candidates.length})</h3>
          {['pending', 'approved', 'rejected', 'disqualified', 'withdrawn'].map(statusGroup => {
            const group = candidates.filter(c => c.status === statusGroup);
            if (group.length === 0) return null;
            return (
              <div key={statusGroup} style={{ marginBottom: '28px' }}>
                <h4 style={{ color: statusColor(statusGroup), marginBottom: '10px', textTransform: 'capitalize' }}>
                  {statusGroup} ({group.length})
                </h4>
                {group.map(c => (
                  <div key={c.id} style={styles.rowCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={styles.avatar}>
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div>
                        <p style={styles.rowTitle}>{c.first_name} {c.last_name}</p>
                        <p style={styles.rowSub}>🏛 {c.position} &nbsp;·&nbsp; 🗳 {c.election} &nbsp;·&nbsp; 🎖 {c.party || 'Independent'}</p>
                        {c.running_mate_first && (
                          <p style={styles.rowSub}>Running mate: {c.running_mate_first} {c.running_mate_last}</p>
                        )}
                        <p style={styles.rowSub}>Registered: {new Date(c.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={styles.rowActions}>
                      <span style={{...styles.statusBadge, backgroundColor: statusColor(c.status)}}>
                        {c.status}
                      </span>
                      {c.status === 'pending' && (
                        <>
                          <button style={{...styles.actionBtn, backgroundColor: '#2ecc71'}}
                            onClick={() => handleCandidateStatus(c.id, 'approved')}>✅ Approve</button>
                          <button style={{...styles.actionBtn, backgroundColor: '#e74c3c'}}
                            onClick={() => handleCandidateStatus(c.id, 'rejected')}>❌ Reject</button>
                        </>
                      )}
                      {c.status === 'approved' && (
                        <button style={{...styles.actionBtn, backgroundColor: '#c0392b'}}
                          onClick={() => handleCandidateStatus(c.id, 'disqualified')}>Disqualify</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {candidates.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No candidates registered yet.</p>
          )}
        </div>
      )}

      {/* VOTERS */}
      {tab === 'voters' && (
        <div>
          <h3 style={styles.sectionTitle}>Registered Voters ({voters.length})</h3>
          {voters.map(v => (
            <div key={v.id} style={styles.rowCard}>
              <div>
                <p style={styles.rowTitle}>{v.first_name} {v.last_name}</p>
                <p style={styles.rowSub}>{v.national_id} · {v.email} · {v.constituency}</p>
                <p style={styles.rowSub}>{v.voter_registration_number}</p>
              </div>
              <div style={styles.rowActions}>
                {v.is_verified ? (
                  <span style={{...styles.statusBadge, backgroundColor: '#2ecc71'}}>✅ Verified</span>
                ) : (
                  <button style={{...styles.actionBtn, backgroundColor: '#2ecc71'}}
                    onClick={() => handleVerifyVoter(v.id)}>Verify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PARTIES */}
      {tab === 'parties' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Register Political Party</h3>
            <form onSubmit={handleCreateParty}>
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Party Name</label>
                  <input value={partyForm.name} style={styles.input} required
                    onChange={e => setPartyForm({...partyForm, name: e.target.value})}
                    placeholder="Full party name" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Abbreviation</label>
                  <input value={partyForm.abbreviation} style={styles.input} required
                    onChange={e => setPartyForm({...partyForm, abbreviation: e.target.value})}
                    placeholder="e.g. UDA" />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Founded Date</label>
                <input type="date" value={partyForm.founded_date} style={styles.input}
                  onChange={e => setPartyForm({...partyForm, founded_date: e.target.value})} />
              </div>
              <button type="submit" style={styles.btn}>Register Party</button>
            </form>
          </div>
          <h3 style={styles.sectionTitle}>Political Parties ({parties.length})</h3>
          {parties.map(p => (
            <div key={p.id} style={styles.rowCard}>
              <div>
                <p style={styles.rowTitle}>{p.name}</p>
                <p style={styles.rowSub}>{p.abbreviation} · Founded: {p.founded_date ? new Date(p.founded_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <span style={{...styles.statusBadge, backgroundColor: p.is_active ? '#2ecc71' : '#e74c3c'}}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* LOGS */}
      {tab === 'logs' && (
        <div>
          <h3 style={styles.sectionTitle}>Audit Logs (Latest 100)</h3>
          {logs.map(log => (
            <div key={log.id} style={styles.logRow}>
              <span style={styles.logAction}>{log.action}</span>
              <span style={styles.logUser}>{log.citizen_name || 'System'}</span>
              <span style={styles.logDesc}>{log.description}</span>
              <span style={styles.logTime}>{new Date(log.performed_at).toLocaleString()}</span>
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
  tabs: { display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' },
  tab: { padding: '8px 20px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', position: 'relative' },
  activeTab: { padding: '8px 20px', borderRadius: '6px', border: '1px solid #1a3c6e', backgroundColor: '#1a3c6e', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', position: 'relative' },
  tabBadge: { backgroundColor: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '11px', marginLeft: '6px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center' },
  statValue: { fontSize: '36px', fontWeight: 'bold', color: '#1a3c6e', margin: '0 0 6px' },
  statLabel: { color: '#888', fontSize: '13px', margin: 0 },
  formCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  formTitle: { color: '#1a3c6e', marginBottom: '18px', fontSize: '18px' },
  formRow: { display: 'flex', gap: '14px' },
  field: { flex: 1, marginBottom: '16px', position: 'relative' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '13px' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
  btn: { backgroundColor: '#1a3c6e', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '7px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '7px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' },
  dropdownItem: { padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' },
  selectedBadge: { color: '#27ae60', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 'bold' },
  sectionTitle: { color: '#1a3c6e', marginBottom: '14px', fontSize: '18px' },
  rowCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', marginBottom: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontWeight: 'bold', color: '#333', margin: '0 0 4px', fontSize: '15px' },
  rowSub: { color: '#888', margin: '2px 0', fontSize: '13px' },
  rowActions: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  statusBadge: { color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  actionBtn: { backgroundColor: '#1a3c6e', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1a3c6e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', flexShrink: 0 },
  logRow: { backgroundColor: '#fff', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', fontSize: '13px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  logAction: { color: '#1a3c6e', fontWeight: 'bold' },
  logUser: { color: '#e67e22' },
  logDesc: { color: '#555' },
  logTime: { color: '#999', textAlign: 'right' }
};

export default AdminDashboard;