import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const role = 'buyer';

  // Restore form data if user navigates back from OTP page
  useEffect(() => {
    const savedFormData = localStorage.getItem('registerFormData');
    if (savedFormData) {
      const {
        name: n,
        email: e,
        password: p,
        confirmPassword: cp,
      } = JSON.parse(savedFormData);
      setName(n || '');
      setEmail(e || '');
      setPassword(p || '');
      setConfirmPassword(cp || '');
      localStorage.removeItem('registerFormData');
    }
  }, []);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const namePattern = /^[A-Za-z\s]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!namePattern.test(name)) {
      alert('Name can only contain letters and spaces');
      setLoading(false);
      return;
    }
    if (!emailPattern.test(email)) {
      alert('Invalid email address');
      setLoading(false);
      return;
    }
    if (!isPasswordValid) {
      alert('Password does not meet all requirements');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Save form data in case user goes back from OTP page
      localStorage.setItem(
        'registerFormData',
        JSON.stringify({ name, email, password, confirmPassword })
      );

      // Send OTP to email for verification
      const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'register' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Temporarily store user data until OTP is verified
      localStorage.setItem(
        'tempUser',
        JSON.stringify({ name, email, password, role })
      );
      localStorage.setItem('otpEmail', email);
      localStorage.setItem('otpPurpose', 'register');
      localStorage.setItem('otpExpiry', data.expiresAt);

      navigate('/verify-otp', {
        state: { email, purpose: 'register' },
      });
    } catch (err) {
      alert(err.message);
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

      localStorage.removeItem('registerFormData');
      localStorage.removeItem('tempUser');

      navigate('/buyer-home');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleRegister} className="login-form">
        <h2>Register</h2>

        {/* Name */}
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || namePattern.test(v)) setName(v);
          }}
          required
          placeholder="Enter your full name"
        />

        {/* Email */}
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          required
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          style={{ textTransform: 'none' }}
          placeholder="Enter your email"
        />

        {/* Password */}
        <label>Password:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        {password && (
          <ul className="password-criteria">
            {!passwordRules.length && <li>Minimum 8 characters</li>}
            {!passwordRules.uppercase && <li>At least one uppercase letter</li>}
            {!passwordRules.lowercase && <li>At least one lowercase letter</li>}
            {!passwordRules.number && <li>At least one number</li>}
            {!passwordRules.special && (
              <li>At least one special character (@$!%*?&#)</li>
            )}
          </ul>
        )}

        {/* Confirm Password */}
        <label>Confirm Password:</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        {confirmPassword && password !== confirmPassword && (
          <p className="password-error">Passwords do not match</p>
        )}

        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Register'}
        </button>

        <p style={{ marginTop: '20px' }}>
          Already have an account?
          <Link to="/login"> Login Here</Link>
        </p>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google Sign Up Failed')}
            width="320"
            text="signup_with"
          />
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
