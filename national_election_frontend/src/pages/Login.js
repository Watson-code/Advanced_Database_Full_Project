import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginCitizen } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ national_id: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginCitizen(form);
      const { token, citizen } = res.data;
      localStorage.setItem('token',      token);
      localStorage.setItem('role',       citizen.role);
      localStorage.setItem('first_name', citizen.first_name);
      localStorage.setItem('id',         citizen.id);
      toast.success('Login successful!');
      setTimeout(() => {
        if (citizen.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/candidates');
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.card}>
        <h2 style={styles.title}>🗳️ Welcome Back</h2>
        <p style={styles.subtitle}>National Election Management System</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>National ID</label>
            <input
              name="national_id"
              value={form.national_id}
              onChange={handleChange}
              placeholder="Enter your National ID"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>
          <button
            type="submit"
            style={loading ? styles.btnDisabled : styles.btn}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px'
  },
  title: {
    textAlign: 'center',
    color: '#1a3c6e',
    marginBottom: '6px',
    fontSize: '26px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '28px',
    fontSize: '13px'
  },
  field: { marginBottom: '18px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#444',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '7px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a3c6e',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px'
  },
  btnDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#aaa',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '16px',
    cursor: 'not-allowed',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666'
  },
  link: { color: '#1a3c6e', fontWeight: 'bold' }
};

export default Login;
