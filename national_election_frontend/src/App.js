import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar            from './components/Navbar';
import Login             from './pages/Login';
import Register          from './pages/Register';
import Home              from './pages/Home';
import AdminDashboard    from './pages/AdminDashboard';
import VoterRegistration from './pages/VoterRegistration';
import Candidates        from './pages/Candidates';
import CastVote          from './pages/CastVote';
import LiveResults       from './pages/LiveResults';

// ── Protected Route ──
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// ── Admin Only Route ──
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  if (role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        {/* Public Routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Results */}
        <Route path="/results" element={<LiveResults />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/voter-registration" element={
          <ProtectedRoute><VoterRegistration /></ProtectedRoute>
        } />
        <Route path="/candidates" element={
          <ProtectedRoute><Candidates /></ProtectedRoute>
        } />
        <Route path="/vote" element={
          <ProtectedRoute><CastVote /></ProtectedRoute>
        } />

        {/* Admin Only */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;