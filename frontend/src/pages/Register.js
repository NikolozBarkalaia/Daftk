import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      showSuccess('Registration successful. You can now sign in.');
      navigate('/admin/login');
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Create Account</h1>
        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/admin/login" style={{ textDecoration: 'underline' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
