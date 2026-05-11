import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const { showError, showSuccess } = useNotification();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      showSuccess('Welcome back!');
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      showError(error || 'Invalid credentials');
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Sign In</h1>
        <form onSubmit={submitHandler}>
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
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          New to DaftK? <Link to="/register" style={{ textDecoration: 'underline' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
