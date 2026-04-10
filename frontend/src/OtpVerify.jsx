import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpVerify = () => {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const email = location.state?.email || localStorage.getItem('otpEmail');
  const purpose = location.state?.purpose || localStorage.getItem('otpPurpose');

  useEffect(() => {
    if (!email || !purpose) {
      alert('Invalid access. Please try again.');
      navigate('/register');
      return;
    }

    const expiryTime = localStorage.getItem('otpExpiry');

    const updateTimer = () => {
      if (!expiryTime) {
        setTimeLeft(0);
        setCanResend(true);
        return;
      }

      const diff = Math.floor(
        (new Date(expiryTime).getTime() - Date.now()) / 1000
      );

      if (diff <= 0) {
        setTimeLeft(0);
        setCanResend(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeft(diff);
        setCanResend(false);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, purpose, navigate]);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    if (timeLeft <= 0) {
      alert('OTP has expired. Please request a new one.');
      return;
    }

    setVerifying(true);

    try {
      // Step 1: Verify OTP
      const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (!data.verified) throw new Error('OTP verification failed');

      // Step 2: Create the account
      const tempUser = JSON.parse(localStorage.getItem('tempUser'));
      if (!tempUser)
        throw new Error('Registration data not found. Please register again.');

      const registerRes = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempUser.name,
          email: tempUser.email,
          password: tempUser.password,
          role: tempUser.role || 'buyer',
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.message);

      // Step 3: Auto-login
      const loginRes = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempUser.email,
          password: tempUser.password,
          loginType: 'buyer',
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message);

      // Store session data
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('userId', loginData.user.id);
      localStorage.setItem('userName', loginData.user.name);
      localStorage.setItem('userEmail', loginData.user.email);
      localStorage.setItem('hasPassword', loginData.user.hasPassword);
      localStorage.setItem('userRole', loginData.user.role);
      localStorage.setItem(
        'profilePicUrl',
        loginData.user.profilePicUrl || '/uploads/profile-pic.webp'
      );

      // Clean up temporary data
      localStorage.removeItem('tempUser');
      localStorage.removeItem('otpEmail');
      localStorage.removeItem('otpPurpose');
      localStorage.removeItem('otpExpiry');
      localStorage.removeItem('registerFormData');

      if (loginData.user.role === 'buyer') {
        navigate('/buyer-home');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setResending(true);

    try {
      const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('otpExpiry', data.expiresAt);
      setCanResend(false);
      setTimeLeft(
        Math.max(
          0,
          Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
        )
      );

      alert('New OTP sent to your email!');
    } catch (err) {
      alert(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    navigate('/register');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <button type="button" onClick={handleBack} className="back-btn">
          ← Back to Register
        </button>

        <h2>Verify OTP</h2>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to
          <br />
          <strong style={{ textTransform: 'none' }}>{email}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="otp-input"
        />

        <div className="timer-container">
          <div
            className={`timer ${
              timeLeft <= 10 && timeLeft > 0 ? 'timer-warning' : ''
            } ${timeLeft === 0 ? 'timer-expired' : ''}`}
          >
            <span className="timer-icon">{timeLeft === 0 ? '⏰' : '⏳'}</span>
            <span
              className="timer-text"
              style={{ color: 'white', fontSize: '1.2rem' }}
            >
              {timeLeft === 0
                ? 'OTP has expired'
                : `Expires in: ${formatTime(timeLeft)}`}
            </span>
          </div>
        </div>

        <button
          onClick={verifyOtp}
          disabled={verifying || otp.length !== 6 || timeLeft === 0}
          className="verify-btn"
        >
          {verifying ? (
            <>
              <span className="spinner"></span>
              Verifying...
            </>
          ) : timeLeft === 0 ? (
            'OTP Expired'
          ) : (
            'Verify & Create Account'
          )}
        </button>

        <div className="resend-section">
          <p className="resend-text">
            {canResend ? 'Need a new OTP?' : "Didn't receive OTP?"}
          </p>
          <button
            onClick={handleResendOtp}
            disabled={!canResend || resending}
            className={`resend-btn ${
              canResend && !resending ? 'resend-active' : 'resend-disabled'
            }`}
          >
            {resending
              ? 'Sending OTP...'
              : canResend
              ? 'Resend OTP'
              : `Resend OTP in ${formatTime(timeLeft)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
