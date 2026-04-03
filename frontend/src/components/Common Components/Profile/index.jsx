import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  /* ================= SESSION GUARD ================= */
  useEffect(() => {
    if (!userId || !token) {
      alert('Session expired. Please login again.');
      navigate('/login');
    }
  }, [userId, token, navigate]);

  /* ================= BASIC USER INFO ================= */
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const [email] = useState(localStorage.getItem('userEmail'));

  /* ================= SELLER INFO ================= */
  const [sellerData, setSellerData] = useState(null);

  /* ================= PASSWORD ================= */
  const hasPassword = localStorage.getItem('hasPassword') === 'true';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  /* ================= PROFILE PICTURE ================= */
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem('profilePicUrl') || '/uploads/profile-pic.webp'
  );

  /* ================= REGEX ================= */
  const namePattern = /^[A-Za-z\s]+$/;
  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  /* ================= FETCH SELLER PROFILE ================= */
  useEffect(() => {
    if (role === 'seller') {
      fetch('http://localhost:5000/api/seller/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setSellerData(data))
        .catch(() => alert('Failed to load seller profile'));
    }
  }, [role, token]);

  /* ================= UPDATE BASIC PROFILE ================= */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!namePattern.test(name)) {
      alert('Name must contain only letters and spaces');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('userName', data.user.name);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await fetch(
        `http://localhost:5000/api/profile-picture/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('profilePicUrl', data.profilePicUrl);
      setProfilePic(data.profilePicUrl);

      alert('Profile picture updated!');
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= UPDATE SELLER PROFILE ================= */
  const handleUpdateSeller = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/seller/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName: sellerData.storeName,
          gstNumber: sellerData.gstNumber,
          address: sellerData.address,
          bankDetails: sellerData.bankDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error);

      alert('Seller profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (hasPassword && !currentPassword) {
      alert('Current password is required');
      return;
    }

    if (!strongPasswordPattern.test(newPassword)) {
      alert('Strong password required');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/profile/change-password/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: hasPassword ? currentPassword : null,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message);
      }

      alert('Password updated successfully!');
      localStorage.setItem('hasPassword', 'true');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-glass">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button className="exit-btn" onClick={() => navigate(-1)}>
            ← Exit
          </button>
        </div>

        {/* ================= PROFILE PICTURE ================= */}
        <div className="profile-pic-section">
          <img
            src={`http://localhost:5000${profilePic}`}
            alt="Profile"
            className="profile-pic-large"
          />

          <label className="upload-btn">
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleProfilePicUpload}
            />
          </label>
        </div>

        {/* ================= ACCOUNT INFO ================= */}
        <form onSubmit={handleUpdateProfile} className="profile-section">
          <h3>Account Info</h3>

          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input value={email} readOnly />

          <label>Role</label>
          <input value={role} disabled />

          <button className="primary-btn">Save Changes</button>
        </form>

        {/* ================= SELLER INFO ================= */}
        {role === 'seller' && sellerData && (
          <form onSubmit={handleUpdateSeller} className="profile-section">
            <h3>Seller Details</h3>

            <label>Store Name</label>
            <input
              value={sellerData.storeName}
              onChange={(e) =>
                setSellerData({ ...sellerData, storeName: e.target.value })
              }
            />

            <label>Business Type</label>
            <input value={sellerData.businessType} disabled />

            <label>GST Number</label>
            <input
              value={sellerData.gstNumber || ''}
              onChange={(e) =>
                setSellerData({ ...sellerData, gstNumber: e.target.value })
              }
            />

            <label>PAN Number</label>
            <input value={sellerData.panNumber} disabled />

            <button className="primary-btn">Update Seller Info</button>
          </form>
        )}

        {/* ================= SECURITY ================= */}
        <form onSubmit={handleChangePassword} className="profile-section">
          <h3>Security</h3>

          {hasPassword && (
            <>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </>
          )}

          <label>{hasPassword ? 'New Password' : 'Set Password'}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Strong password required"
          />

          <button className="secondary-btn">
            {hasPassword ? 'Change Password' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
