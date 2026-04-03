import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import Navbar from './Navbar';
import Logout from '../../../Common Components/Logout';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(false);
  window.onscroll = () => {
    setActiveMenu(false);
  };
  const handleMenuButton = () => {
    setActiveMenu(!activeMenu);
  };

  const userName = localStorage.getItem('userName');
  const route = localStorage.getItem('userRole').toLowerCase() + '-home';
  const profilePicUrl =
    localStorage.getItem('profilePicUrl') || '/uploads/profile-pic.webp';

  return (
    <header className="header">
      <a href="/" className="logo">
        {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
        Pics Prism
      </a>
      <Navbar active={activeMenu} />
      <div className="icons">
        <button type="button" id="menu-btn" onClick={handleMenuButton}>
          <FontAwesomeIcon className="fa-icon" icon={faBars} />
        </button>
        {userName && (
          <Link to={`/${route}/profile`} className="profile-link">
            <img
              src={`http://localhost:5000${profilePicUrl}`}
              alt="profile"
              className="profile-pic"
            />
            <span className="profile-name">{userName}</span>
          </Link>
        )}
        {userName ? (
          <Logout />
        ) : (
          <button
            style={{ width: '7.5rem' }}
            onClick={() => {
              navigate('/login');
            }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
