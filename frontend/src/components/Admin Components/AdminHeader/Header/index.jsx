import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import Navbar from './Navbar';
import Logout from '../../../Common Components/Logout';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(false);
  const navigate = useNavigate();
  window.onscroll = () => {
    setActiveMenu(false);
  };
  const handleMenuButton = () => {
    setActiveMenu(!activeMenu);
  };
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('userRole').toLowerCase();
  const profilePicUrl =
    localStorage.getItem('profilePicUrl') || '/uploads/profile-pic.webp';

  const route = role + '-home';

  return (
    <header className="header">
      <a href="/" className="logo">
        {/* <i>
          <FontAwesomeIcon icon={faShoppingBasket} />
        </i> */}
        {/* <img
            className="p-1"
            src="/image/logo.png"
            width="40"
            height="40"
            style={{marginRight:"15px"}}
        ></img> */}
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
