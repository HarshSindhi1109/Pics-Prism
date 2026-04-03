import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Logout.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasPassword');
    localStorage.removeItem('profilePicUrl');

    // Clear buyer + seller form data
    localStorage.removeItem('loginFormData');
    localStorage.removeItem('sellerLoginFormData');
    localStorage.removeItem('registerFormData');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('savedItems');
    localStorage.removeItem('rzp_checkout_anon_id')
    localStorage.removeItem('rzp_device_id')
    localStorage.removeItem('rzp_stored_checkout_id')
    localStorage.removeItem('fromOtpPage')
    localStorage.removeItem('role')

    //  CLEAR OTP & Temp DATA
    localStorage.removeItem('tempUser');
    localStorage.removeItem('otpEmail');
    localStorage.removeItem('otpPurpose');
    localStorage.removeItem('otpType');
    localStorage.removeItem('otpExpiry');
    localStorage.removeItem('loginType');

    navigate('/login', { replace: true });
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      <FontAwesomeIcon
        icon={faSignOutAlt}
        className="logout-icon fa-icon"
        style={{ fontSize: '20px' }}
      />
    </button>
  );
};

export default LogoutButton;
