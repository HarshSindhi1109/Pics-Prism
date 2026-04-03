import React from 'react';
import './SecurityPolicy.css';
import {
  FaShieldAlt,
  FaLock,
  FaUserCheck,
  FaCreditCard,
  FaBug,
  FaEnvelope,
} from 'react-icons/fa';

const SecurityPolicy = () => {
  return (
    <div className="security-page">
      {/* Header */}
      <div className="security-header">
        <FaShieldAlt className="security-header-icon" />
        <h1>Security Policy</h1>
        <p>
          At Pics Prism, your security is our top priority. This policy explains
          how we protect your data, transactions, and account from unauthorized
          access and cyber threats.
        </p>
        <div className="last-updated">Last Updated: April 2024</div>
      </div>

      {/* Content */}
      <div className="security-content">
        {/* Section 1 */}
        <div className="security-section">
          <FaLock className="section-icon" />
          <h2>1. Data Protection & Encryption</h2>
          <p>
            All sensitive information transmitted through our platform is
            secured using industry-standard SSL/TLS encryption. This ensures
            that your personal and payment data remains confidential during
            transmission.
          </p>
          <ul>
            <li>256-bit SSL encryption</li>
            <li>Encrypted data storage</li>
            <li>Secure HTTPS connections</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="security-section">
          <FaCreditCard className="section-icon" />
          <h2>2. Payment Security</h2>
          <p>
            We do not store your card or banking details on our servers. All
            payments are processed through trusted third-party payment gateways
            that comply with PCI-DSS security standards.
          </p>
          <ul>
            <li>PCI-DSS compliant payment gateways</li>
            <li>Secure UPI, card, and net banking transactions</li>
            <li>Tokenized payment processing</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="security-section">
          <FaUserCheck className="section-icon" />
          <h2>3. Account Security</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            login credentials. We strongly recommend using strong passwords and
            not sharing account details with others.
          </p>
          <ul>
            <li>Hashed and salted passwords</li>
            <li>Login attempt monitoring</li>
            <li>Session-based authentication</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="security-section">
          <FaBug className="section-icon warning" />
          <h2>4. Fraud Prevention & Monitoring</h2>
          <p>
            We continuously monitor activity on our platform to detect and
            prevent fraudulent transactions, unauthorized access, and misuse of
            our services.
          </p>
          <ul>
            <li>Automated fraud detection systems</li>
            <li>Suspicious activity alerts</li>
            <li>Account suspension for policy violations</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="security-section">
          <h2>5. Data Access Control</h2>
          <p>
            Access to personal and transactional data is restricted to
            authorized personnel only and is governed by strict internal
            policies and access controls.
          </p>
          <ul>
            <li>Role-based access control (RBAC)</li>
            <li>Regular security audits</li>
            <li>Minimal data access principle</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="security-section">
          <h2>6. Security Updates</h2>
          <p>
            We regularly update our systems, libraries, and infrastructure to
            protect against known vulnerabilities and emerging security risks.
          </p>
        </div>

        {/* Contact */}
        <div className="security-contact">
          <FaEnvelope className="contact-icon" />
          <h3>Report a Security Issue</h3>
          <p>
            If you believe you have discovered a security vulnerability or
            suspicious activity, please contact us immediately.
          </p>
          <div className="contact-details">
            <p>
              <strong>Email:</strong> security@picsprism.com
            </p>
            <p>
              <strong>Response Time:</strong> Within 48 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
