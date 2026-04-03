import React from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';
import { NavLink } from 'react-router-dom'; // Change from <a> tags to NavLink

export default function Navbar(props) {
  const { active } = props;

  // Define your vendor navigation links
  const vendorLinks = [
    { to: '/seller-home', label: 'Home', exact: true },
    { to: '/seller-home/add-product', label: 'Add Product' },
    { to: '/seller-home/manage-order-status', label: 'Manage Order Status' },
    { to: '/seller-home/customer-reviews', label: 'Customer Reviews' },
  ];

  return (
    <nav className={`navbar ${active ? 'active' : ''}`}>
      {vendorLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.exact} // This makes sure Home is only active on exact match
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
