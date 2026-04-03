import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpVerify = () => {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  // ✅ Get email and purpose from state or localStorage
  const email = location.state?.email || localStorage.getItem('otpEmail');

  const purpose = location.state?.purpose || localStorage.getItem('otpPurpose');

  const loginType =
    localStorage.getItem('loginType') ||
    (purpose === 'login' ? 'buyer' : undefined);

  useEffect(() => {
    if (!email || !purpose) {
      alert('Invalid access. Please try again.');
      navigate(purpose === 'register' ? '/register' : '/login');
      return;
    }

    const expiryTime = localStorage.getItem('otpExpiry');

    const updateTimer = () => {
      if (!expiryTime) {
        // No expiry time stored - OTP might have expired
        setTimeLeft(0);
        setCanResend(true);
        setTimerActive(false);
        return;
      }

      const now = Date.now();
      const expiry = new Date(expiryTime).getTime();
      const diff = Math.floor((expiry - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        setCanResend(true);
        setTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeft(diff);
        setCanResend(false);
        setTimerActive(true);
      }
    };

    // Initial update
    updateTimer();

    // Start timer only if we have an expiry time
    if (timerActive) {
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, purpose, navigate, timerActive]);

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
      const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          purpose,
          loginType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 🔐 REGISTRATION FLOW
      if (purpose === 'register') {
        if (!data.verified) {
          throw new Error('OTP verification failed');
        }

        // Get the temporary user data
        const tempUser = JSON.parse(localStorage.getItem('tempUser'));
        if (!tempUser) {
          throw new Error(
            'Registration data not found. Please register again.'
          );
        }

        // Now create the user account
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

        // Auto-login the user after registration
        const loginRes = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: tempUser.email,
            password: tempUser.password,
          }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);

        // Store user data
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

        // Clear all temporary data
        localStorage.removeItem('tempUser');
        localStorage.removeItem('otpEmail');
        localStorage.removeItem('otpPurpose');
        localStorage.removeItem('otpExpiry');
        localStorage.removeItem('registerFormData');

        // Redirect based on role
        if (loginData.user.role === 'buyer') {
          navigate('/buyer-home');
        }
      }

      // 🔐 LOGIN FLOW (passwordless) - existing code
      if (purpose === 'login') {
        const { token, user } = data;

        if (!user?._id) {
          alert('Login failed. Please login again.');
          navigate('/login');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('hasPassword', user.hasPassword);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem(
          'profilePicUrl',
          user.profilePicUrl || '/uploads/profile-pic.webp'
        );

        // Clear OTP-related storage
        localStorage.removeItem('tempUser');
        localStorage.removeItem('otpEmail');
        localStorage.removeItem('otpPurpose');
        localStorage.removeItem('otpType');
        localStorage.removeItem('otpExpiry');
        localStorage.removeItem('loginFormData');
        localStorage.removeItem('sellerLoginFormData');

        // Redirect based on role
        if (user.role === 'buyer') {
          navigate('/buyer-home');
        } else if (user.role === 'seller') {
          navigate('/seller-home');
        } else if (user.role === 'admin') {
          navigate('/admin-home');
        }
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

      // 🔄 Save new expiry and reset timer
      localStorage.setItem('otpExpiry', data.expiresAt);
      setCanResend(false);
      setTimerActive(true);

      const newExpiry = new Date(data.expiresAt).getTime();
      setTimeLeft(Math.max(0, Math.floor((newExpiry - Date.now()) / 1000)));

      alert('New OTP sent to your email!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle back button click
  const handleBack = () => {
    // Save the OTP page state if needed
    localStorage.setItem('fromOtpPage', 'true');

    // Determine where to go back based on purpose
    if (purpose === 'register') {
      navigate('/register');
    } else if (purpose === 'login') {
      if (loginType === 'seller') {
        navigate('/seller-login');
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login'); // fallback
    }
  };

  // Format time display (MM:SS)
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
        {/* Back Button */}
        <button type="button" onClick={handleBack} className="back-btn">
          ← Back to{' '}
          {purpose === 'register'
            ? 'Register'
            : loginType === 'seller'
            ? 'Seller Login'
            : 'Login'}
        </button>

        <h2>Verify OTP</h2>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to
          <br />
          <strong style={{ textTransform: 'none' }}>{email}</strong>
        </p>

        {/* OTP Input Field */}
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="otp-input"
        />

        {/* Timer Display */}
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

        {/* Verify Button */}
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
            'Verify OTP'
          )}
        </button>

        {/* Resend OTP Section */}
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
