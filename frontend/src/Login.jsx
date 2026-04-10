import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!password) {
        throw new Error('Please enter your password');
      }

      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: 'buyer' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('hasPassword', data.user.hasPassword);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem(
        'profilePicUrl',
        data.user.profilePicUrl || '/uploads/profile-pic.webp'
      );

      if (data.user.role === 'buyer') {
        navigate('/buyer-home');
      } else if (data.user.role === 'seller') {
        navigate('/seller-home');
      } else if (data.user.role === 'admin') {
        navigate('/admin-home');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5000/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('hasPassword', data.user.hasPassword);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem(
        'profilePicUrl',
        data.user.profilePicUrl || '/uploads/profile-pic.webp'
      );

      if (data.user.role === 'buyer') {
        navigate('/buyer-home');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          style={{ textTransform: 'none' }}
          placeholder="Enter your email"
        />

        <label>Password:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ marginTop: '20px' }}>
          Don't have an account?
          <Link to="/register"> Register Here</Link>
        </p>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google Login Failed')}
            width="320"
          />
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
