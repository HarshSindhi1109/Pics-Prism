import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';

const SellerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved form data when coming back from OTP page
  useEffect(() => {
    const savedFormData = localStorage.getItem('sellerLoginFormData');
    if (savedFormData) {
      const { email: savedEmail } = JSON.parse(savedFormData);
      setEmail(savedEmail || '');
      localStorage.removeItem('sellerLoginFormData'); // Clear after loading
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
      localStorage.setItem('sellerLoginFormData', JSON.stringify({ email }));

      // Check if seller exists first
      const checkUserRes = await fetch('http://localhost:5000/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'seller' }),
      });

      const userData = await checkUserRes.json();

      if (!checkUserRes.ok) {
        throw new Error(userData.message || 'Seller not found or not approved');
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

      // Store OTP data
      localStorage.setItem('otpEmail', email);
      localStorage.setItem('otpPurpose', 'login');
      localStorage.setItem('loginType', 'seller');
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
      localStorage.removeItem('sellerLoginFormData');

      // ROLE BASED REDIRECT
      if (data.user.role === 'seller') {
        navigate('/seller-home');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Seller Login</h2>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>

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

export default SellerLoginPage;
