import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const location = useLocation();

  // Load saved form data when coming back from OTP page
  useEffect(() => {
    const savedFormData = localStorage.getItem('loginFormData');
    if (savedFormData) {
      const { email: savedEmail } = JSON.parse(savedFormData);
      setEmail(savedEmail || '');
      localStorage.removeItem('loginFormData'); // Clear after loading
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      // Validate email
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Save form data in case user goes back from OTP page
      localStorage.setItem('loginFormData', JSON.stringify({ email }));

      // Check if user exists first
      const checkUserRes = await fetch('http://localhost:5000/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'buyer' }),
      });

      const userData = await checkUserRes.json();

      if (!checkUserRes.ok) {
        throw new Error(userData.message || 'User not found');
      }

      // Send OTP for login
      const otpRes = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'login',
        }),
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.message);

      // Store user info and OTP data
      localStorage.setItem('otpEmail', email);
      localStorage.setItem('otpPurpose', 'login');
      localStorage.setItem('loginType', 'buyer');
      localStorage.setItem('otpExpiry', otpData.expiresAt);

      // Redirect to OTP verification page
      navigate('/verify-otp', {
        state: {
          email,
          purpose: 'login',
        },
      });
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5000/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Store user info
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

      // Clear any saved form data
      localStorage.removeItem('loginFormData');

      // ROLE BASED REDIRECT
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
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>
        <p style={{ marginTop: '20px' }}>
          I Don't Have an account
          <Link to="/register"> Register Here</Link>
        </p>

        {/* OR Divider */}
        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* Google Login */}
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
