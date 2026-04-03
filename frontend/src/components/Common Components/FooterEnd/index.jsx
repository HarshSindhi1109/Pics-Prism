import React from 'react';
import './FooterEnd.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaShoppingCart,
  FaHeart,
  FaShippingFast,
  FaCreditCard,
  FaQuestionCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const FooterEnd = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const isLoggedIn = !!role;
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  let basePath = isLoggedIn ? `/${role}-home` : '';

  return (
    <footer className="footerEnd">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand-section">
          <div className="footer-brand">
            {/* <img src="/image/logo.png" alt="Pics Prism Logo" className="footer-logo" /> */}
            <div className="brand-content">
              <button className="logo-btn" onClick={() => navigate('#')}>
                <span className="logo-text">Pics Prism</span>
              </button>
              <p className="brand-tagline">
                Your gateway to premium products and creative excellence
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main-content">
          <div className="footer-columns">
            {/* User Area */}
            {isLoggedIn && (
              <div className="footer-column">
                <h4 className="column-title">
                  <span className="title-icon">👤</span>
                  USER AREA
                </h4>

                <ul className="footer-links-list">
                  {/* ✅ Cart → Buyer + Seller */}
                  {(isBuyer || isSeller) && (
                    <li>
                      <Link to={`${basePath}/cart`} className="footer-link">
                        <FaShoppingCart className="link-icon" />
                        My Cart
                      </Link>
                    </li>
                  )}

                  {/* ❤️ Wishlist → Buyer ONLY */}
                  {isBuyer && (
                    <li>
                      <Link to="/buyer-home/wishlist" className="footer-link">
                        <FaHeart className="link-icon" />
                        Wishlist
                      </Link>
                    </li>
                  )}

                  {/* 📦 Orders → Buyer + Seller */}
                  {(isBuyer || isSeller) && (
                    <li>
                      <Link to={`${basePath}/order`} className="footer-link">
                        <span className="link-icon">📦</span>
                        My Orders
                      </Link>
                    </li>
                  )}

                  {/* ⚙️ Account Settings → ALL */}
                  <li>
                    <Link to={`${basePath}/profile`} className="footer-link">
                      <span className="link-icon">⚙️</span>
                      Account Settings
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Shopping Guide */}
            <div className="footer-column">
              <h4 className="column-title">
                <span className="title-icon">🛍️</span>
                SHOPPING GUIDE
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link
                    to={`${basePath}/payment-methods`}
                    className="footer-link"
                  >
                    <FaCreditCard className="link-icon" />
                    Payment Methods
                  </Link>
                </li>
                <li>
                  <Link
                    to={`${basePath}/shipping-info`}
                    className="footer-link"
                  >
                    <FaShippingFast className="link-icon" />
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    to={`${basePath}/returns-exchange`}
                    className="footer-link"
                  >
                    <span className="link-icon">🔄</span>
                    Returns & Exchange
                  </Link>
                </li>
                <li>
                  <Link to={`${basePath}/FAQ`} className="footer-link">
                    <FaQuestionCircle className="link-icon" />
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="footer-column">
              <h4 className="column-title">
                <span className="title-icon">📞</span>
                CONTACT DETAILS
              </h4>
              <ul className="contact-list">
                <li className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <span className="contact-label">Sales:</span>
                    <span className="contact-value">+1 (234) 567-8900</span>
                  </div>
                </li>
                <li className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <span className="contact-label">Support:</span>
                    <span className="contact-value">+1 (234) 567-8901</span>
                  </div>
                </li>
                <li className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">support@picsprism.com</span>
                  </div>
                </li>
                <li className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <span className="contact-label">Office:</span>
                    <span className="contact-value">
                      123 Creative Street, Photography City, PC 10001
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="footer-column">
              <h4 className="column-title">
                <span className="title-icon">🌐</span>
                CONNECT WITH US
              </h4>
              <p className="social-description">
                Follow us on social media for the latest updates, photography
                tips, and exclusive offers.
              </p>
              <div className="social-icons-wrapper">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon linkedin"
                >
                  <FaLinkedinIn />
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon pinterest"
                >
                  <span className="pinterest-icon">P</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon youtube"
                >
                  <span className="youtube-icon">▶</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright-section">
              <p className="copyright">
                © 2025 <span className="highlight">Pics Prism</span>. All rights
                reserved.
              </p>
              <p className="additional-info">
                Premium equipment & creative solutions
              </p>
            </div>

            <div className="footer-bottom-links">
              <Link to={`${basePath}/terms-of-service`} className="bottom-link">
                Terms of Service
              </Link>
              <Link to={`${basePath}/privacy-policy`} className="bottom-link">
                Privacy Policy
              </Link>
              <Link to={`${basePath}/security`} className="bottom-link">
                Security
              </Link>
              {role !== 'admin' && (
                <Link
                  to={`${basePath}/contact`}
                  className="bottom-link highlight"
                >
                  Contact Us
                </Link>
              )}
            </div>

            <div className="payment-methods">
              <span className="payment-text">Secure Payment:</span>
              <div className="payment-icons">
                <span className="payment-icon">💳</span>
                <span className="payment-icon">🔒</span>
                <span className="payment-icon">🛡️</span>
                <span className="payment-icon">💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterEnd;
