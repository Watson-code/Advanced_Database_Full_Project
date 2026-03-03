import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCitizen } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    national_id: '', first_name: '', last_name: '',
    email: '', phone_number: '', password: '',
    date_of_birth: '', gender: '', occupation: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNationalIdChange = (e) => {
    const value = e.target.value;
    // Only allow digits, no negatives, no decimals
    if (/^\d*$/.test(value)) {
      setForm({ ...form, national_id: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.national_id || form.national_id.trim() === '') {
      toast.error('National ID is required.');
      return;
    }
    if (parseInt(form.national_id) <= 0) {
      toast.error('National ID must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      await registerCitizen(form);
      toast.success('Registered successfully! Please login.');
      setTimeout(() => navigate('/login'), 1500);
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
        <h2 style={styles.title}>📋 Create Account</h2>
        <p style={styles.subtitle}>Register as a Citizen</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input name="first_name" value={form.first_name}
                onChange={handleChange} placeholder="First name"
                style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input name="last_name" value={form.last_name}
                onChange={handleChange} placeholder="Last name"
                style={styles.input} required />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>National ID</label>
            <input
              name="national_id"
              value={form.national_id}
              onChange={handleNationalIdChange}
              placeholder="National ID number (digits only)"
              style={styles.input}
              inputMode="numeric"
              minLength={1}
              required
            />
            {form.national_id && !/^\d+$/.test(form.national_id) && (
              <span style={styles.errorText}>Only positive numbers allowed.</span>
            )}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="Email address"
              style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <input name="phone_number" value={form.phone_number}
              onChange={handleChange} placeholder="Phone number"
              style={styles.input} />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Date of Birth</label>
              <input name="date_of_birth" type="date"
                value={form.date_of_birth} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Gender</label>
              <select name="gender" value={form.gender}
                onChange={handleChange} style={styles.input} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Occupation</label>
            <input name="occupation" value={form.occupation}
              onChange={handleChange} placeholder="Your occupation"
              style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Create a password"
              style={styles.input} required />
          </div>
          <button type="submit"
            style={loading ? styles.btnDisabled : styles.btn}
            disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', backgroundColor: '#f0f4f8',
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', padding: '30px 0'
  },
  card: {
    backgroundColor: '#fff', padding: '40px',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: '520px'
  },
  title: { textAlign: 'center', color: '#1a3c6e', marginBottom: '6px', fontSize: '26px' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '28px', fontSize: '13px' },
  row: { display: 'flex', gap: '14px' },
  field: { marginBottom: '16px', flex: 1 },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '7px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#1a3c6e', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  btnDisabled: { width: '100%', padding: '12px', backgroundColor: '#aaa', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '16px', cursor: 'not-allowed', marginTop: '8px' },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#1a3c6e', fontWeight: 'bold' },
  errorText: { color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }
};

export default Register;