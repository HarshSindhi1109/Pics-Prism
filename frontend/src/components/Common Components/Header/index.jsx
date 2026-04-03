import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import SearchForm from './SearchForm';
import ShoppingCart from './ShoppingCart';
import Navbar from './Navbar';
import Logout from '../Logout';
import './Header.css';

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(false);
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeShoppingCart, setActiveShoppingCart] = useState(false);
  const navigate = useNavigate();
  let route = '';

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const profilePicUrl =
    localStorage.getItem('profilePicUrl') || '/uploads/profile-pic.webp';

  // Close menus on scroll
  useEffect(() => {
    const handleScroll = () => {
      setActiveShoppingCart(false);
      setActiveSearch(false);
      setActiveMenu(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuButton = () => {
    setActiveMenu((prev) => !prev);
    setActiveSearch(false);
    setActiveShoppingCart(false);
  };

  // const handleSearchButton = () => {
  //   setActiveSearch((prev) => !prev);
  //   setActiveShoppingCart(false);
  //   setActiveMenu(false);
  // };

  const handleShoppingCartButton = () => {
    navigate('/buyer-home/cart');
  };

  if (userRole === 'buyer') {
    route = '/buyer-home';
  } else if (userRole === 'seller') {
    route = '/seller-home';
  } else if (userRole === 'admin') {
    route = '/admin-home';
  }
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => navigate('#')}>
        {/* <FontAwesomeIcon icon={faShoppingBasket} className="logo-icon" /> */}
        {/* <img
            className="p-1"
            src="/image/logo.png"
            width="40"
            height="40"
            style={{marginRight:"15px"}}
        ></img> */}
        <span className="logo-text">Pics Prism</span>
      </button>

      <Navbar active={activeMenu} />

      <div className="icons">
        <button
          type="button"
          id="menu-btn"
          className={`icon-btn ${activeMenu ? 'active' : ''}`}
          onClick={handleMenuButton}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {userName && (
          <Link to={`${route}/profile`} className="profile-link">
            <img
              src={`http://localhost:5000${profilePicUrl}`}
              alt="profile"
              className="profile-pic"
            />
            <span className="profile-name">{userName}</span>
          </Link>
        )}

        <button
          type="button"
          id="cart-btn"
          className="icon-btn"
          onClick={handleShoppingCartButton}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
        </button>
        <Link
          type="button"
          className="icon-btn wishlist-icon"
          to="/buyer-home/wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
          </svg>
        </Link>
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

      <SearchForm active={activeSearch} />
      <ShoppingCart active={activeShoppingCart} />
    </header>
  );
}
