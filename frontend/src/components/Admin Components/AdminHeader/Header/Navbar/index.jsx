import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';
import { NavLink, useLocation } from 'react-router-dom'; // Change from <a> tags to NavLink

export default function Navbar(props) {
  const { active } = props;

  // Define your admin navigation links
  const adminLinks = [
    { to: '/admin-home', label: 'Home', exact: true },
    { to: '/admin-home/user-management', label: 'Manage Seller and Buyer' },
    { to: '/admin-home/manage-categories', label: 'Manage Categories' },
    { to: '/admin-home/coupons', label: 'Coupons & Offers' },
    { to: '/admin-home/add-seller', label: 'Seller Approvals' },
    { to: '/admin-home/contact-messages', label: 'Contact Messages' },
  ];

  const [pendingCount, setPendingCount] = useState(0);
  const [pendingSellerCount, setPendingSellerCount] = useState(0);
  const [showSellerBadge, setShowSellerBadge] = useState(true);
  const [showContactBadge, setShowContactBadge] = useState(true);
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/contact/pending-count',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setPendingCount(data.count);
      } catch (err) {
        console.error('Failed to fetch contact notifications');
      }
    };

    fetchPendingCount();
  }, []);

  useEffect(() => {
    const fetchPendingSellerCount = async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/seller/pending-count',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setPendingSellerCount(data.count);
      } catch (err) {
        console.error('Failed to fetch seller approval notifications');
      }
    };

    fetchPendingSellerCount();
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin-home/add-seller') {
      const timer = setTimeout(() => {
        setShowSellerBadge(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/admin-home/contact-messages') {
      const timer = setTimeout(() => {
        setShowContactBadge(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <nav className={`navbar ${active ? 'active' : ''}`}>
      {adminLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.exact}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active-link' : ''}`
          }
        >
          <span className="nav-label">
            {link.label}

            {link.to === '/admin-home/contact-messages' &&
              pendingCount > 0 &&
              showContactBadge && (
                <span className="nav-badge">{pendingCount}</span>
              )}

            {link.to === '/admin-home/add-seller' &&
              pendingSellerCount > 0 &&
              showSellerBadge && (
                <span className="nav-badge">{pendingSellerCount}</span>
              )}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}

Navbar.propTypes = {
  active: PropTypes.bool,
};
