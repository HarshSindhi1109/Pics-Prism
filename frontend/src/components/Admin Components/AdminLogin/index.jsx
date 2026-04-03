import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // ✅ Store user details in localStorage
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('hasPassword', data.user.hasPassword);
      localStorage.setItem(
        'profilePicUrl',
        data.user.profilePicUrl || '/uploads/profile-pic.webp'
      );

      // Redirect based on role
      if (data.user.role === 'admin') {
        alert(`Welcome, ${data.user.name}!`);
        navigate('/admin-home');
      } else {
        alert('Incorrect Email or Passowrd');
      }
    } catch (error) {
      alert(error.message);
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
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Role: </label>
        <input type="text" value={'Admin'} disabled />
        <br />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
