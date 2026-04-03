// src/components/Common Components/Header/Navbar/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';
import { NavLink } from 'react-router-dom';

export default function Navbar(props) {
  const { active } = props;

  // Define your navigation links with ABSOLUTE PATHS
  const navLinks = [
    { to: '/buyer-home', label: 'home', end: true },
    { to: '/buyer-home/product', label: 'products' },
    { to: '/buyer-home/categories', label: 'categories' },
    { to: '/buyer-home/review', label: 'review' },
    { to: '/buyer-home/order', label: 'Order Status' },
    { to: '/buyer-home/become-seller', label: 'Become Seller' },
  ];

  return (
    <nav className={`navbar ${active ? 'active' : ''}`}>
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active-link' : ''}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

Navbar.propTypes = {
  active: PropTypes.bool,
};
