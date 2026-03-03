import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = 'Bearer ' + token;
  }
  return req;
});

// AUTH
export const registerCitizen  = (data) => API.post('/auth/register', data);
export const loginCitizen     = (data) => API.post('/auth/login', data);
export const getMyProfile     = ()     => API.get('/auth/me');

// VOTERS
export const registerVoter      = (data) => API.post('/voters/register', data);
export const getVoterStatus     = ()     => API.get('/voters/status');
export const getAllVoters        = ()     => API.get('/voters');
export const verifyVoter        = (id)   => API.patch('/voters/' + id + '/verify');

// POLLING STATIONS
export const getPollingStations = () => API.get('/polling-stations');

// ELECTIONS (public - for all logged in users)
export const getElections       = () => API.get('/elections');

// CANDIDATES
export const getAllCandidates       = (election_id) => API.get('/candidates', { params: { election_id } });
export const applyAsCandidate       = (data)        => API.post('/candidates/apply', data);
export const updateCandidate        = (id, data)    => API.patch('/candidates/' + id + '/status', data);
export const adminRegisterCandidate = (data)        => API.post('/candidates/admin-register', data);

// VOTES
export const castVote   = (data) => API.post('/votes/cast', data);
export const getMyVotes = ()     => API.get('/votes/my-votes');

// RESULTS
export const getLiveResults     = (election_id) => API.get('/results/live/' + election_id);
export const getOfficialResults = (election_id) => API.get('/results/official/' + election_id);

// ADMIN
export const getAdminStats          = ()            => API.get('/admin/stats');
export const getAllElections         = ()            => API.get('/admin/elections');
export const createElection         = (data)        => API.post('/admin/elections', data);
export const updateElectionStatus   = (id, data)    => API.patch('/admin/elections/' + id + '/status', data);
export const getAllParties           = ()            => API.get('/admin/parties');
export const createParty            = (data)        => API.post('/admin/parties', data);
export const getAuditLogs           = ()            => API.get('/admin/audit-logs');
export const createRegion           = (data)        => API.post('/admin/regions', data);
export const createConstituency     = (data)        => API.post('/admin/constituencies', data);
export const getElectionPositions   = (election_id) => API.get('/admin/election-positions', { params: { election_id } });
export const createElectionPosition = (data)        => API.post('/admin/election-positions', data);
export const getAllCitizens         = ()            => API.get('/citizens');