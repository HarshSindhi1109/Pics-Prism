import React from 'react';
import './PrivacyPolicy.css';
import {
  FaShieldAlt,
  FaDatabase,
  FaUserLock,
  FaCookieBite,
  FaEye,
  FaEnvelope,
} from 'react-icons/fa';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      {/* Header */}
      <div className="privacy-header">
        <FaShieldAlt className="privacy-header-icon" />
        <h1>Privacy Policy</h1>
        <p>
          At Pics Prism, we are committed to protecting your privacy. This
          policy explains how we collect, use, and safeguard your personal
          information.
        </p>
        <div className="last-updated">Last Updated: April 2024</div>
      </div>

      {/* Main Content */}
      <div className="privacy-content">
        {/* Section 1 */}
        <div className="privacy-section">
          <h2>1. Information We Collect</h2>
          <div className="info-grid">
            <div className="info-card">
              <FaDatabase className="info-icon" />
              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact details</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Shipping/billing address</li>
                <li>Payment information</li>
              </ul>
            </div>

            <div className="info-card">
              <FaEye className="info-icon" />
              <h3>Usage Information</h3>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Purchase history</li>
                <li>Search queries</li>
              </ul>
            </div>

            <div className="info-card">
              <FaCookieBite className="info-icon" />
              <h3>Cookies & Tracking</h3>
              <ul>
                <li>Session cookies</li>
                <li>Analytics cookies</li>
                <li>Preferences cookies</li>
                <li>Advertising cookies</li>
                <li>Security cookies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <div className="usage-grid">
            <div className="usage-item">
              <span className="usage-number">01</span>
              <h3>Order Processing</h3>
              <p>
                To process and fulfill your orders, send order confirmations,
                and provide customer support.
              </p>
            </div>

            <div className="usage-item">
              <span className="usage-number">02</span>
              <h3>Communication</h3>
              <p>
                To send transactional emails, updates about your orders, and
                respond to your inquiries.
              </p>
            </div>

            <div className="usage-item">
              <span className="usage-number">03</span>
              <h3>Website Improvement</h3>
              <p>
                To analyze website usage, improve our services, and enhance user
                experience.
              </p>
            </div>

            <div className="usage-item">
              <span className="usage-number">04</span>
              <h3>Marketing</h3>
              <p>
                To send promotional offers, newsletters, and product updates
                (with your consent).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="privacy-section">
          <FaUserLock className="section-icon" />
          <h2>3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security
            measures to protect your personal data against unauthorized access,
            alteration, disclosure, or destruction.
          </p>
          <div className="security-features">
            <div className="feature">
              <div className="feature-dot secure"></div>
              <span>SSL/TLS encryption</span>
            </div>
            <div className="feature">
              <div className="feature-dot secure"></div>
              <span>Secure payment gateways</span>
            </div>
            <div className="feature">
              <div className="feature-dot secure"></div>
              <span>Regular security audits</span>
            </div>
            <div className="feature">
              <div className="feature-dot secure"></div>
              <span>Access controls and authentication</span>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="privacy-section">
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share your data
            with:
          </p>
          <div className="sharing-cards">
            <div className="sharing-card">
              <h3>Service Providers</h3>
              <p>
                Shipping carriers, payment processors, and IT service providers
                who assist in our operations.
              </p>
            </div>
            <div className="sharing-card">
              <h3>Legal Requirements</h3>
              <p>
                When required by law, regulation, or legal process, or to
                protect our rights and safety.
              </p>
            </div>
            <div className="sharing-card">
              <h3>Business Transfers</h3>
              <p>
                In connection with a merger, acquisition, or sale of assets,
                with appropriate confidentiality protections.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="privacy-section">
          <h2>5. Your Rights</h2>
          <div className="rights-grid">
            <div className="right-card">
              <h3>Access & Correction</h3>
              <p>
                Access and update your personal information through your account
                settings.
              </p>
            </div>
            <div className="right-card">
              <h3>Data Portability</h3>
              <p>
                Request a copy of your data in a structured, machine-readable
                format.
              </p>
            </div>
            <div className="right-card">
              <h3>Deletion</h3>
              <p>
                Request deletion of your personal data, subject to legal
                requirements.
              </p>
            </div>
            <div className="right-card">
              <h3>Opt-Out</h3>
              <p>
                Opt out of marketing communications by clicking unsubscribe in
                any email.
              </p>
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="privacy-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this policy, unless a longer
            retention period is required by law.
          </p>
          <div className="retention-info">
            <div className="retention-item">
              <strong>Transaction data:</strong> 7 years for tax purposes
            </div>
            <div className="retention-item">
              <strong>Account information:</strong> Until account deletion
              request
            </div>
            <div className="retention-item">
              <strong>Marketing data:</strong> Until consent is withdrawn
            </div>
            <div className="retention-item">
              <strong>Analytics data:</strong> 26 months anonymized
            </div>
          </div>
        </div>

        {/* Section 7 */}
        <div className="privacy-section">
          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from children. If
            you believe we have collected information from a child, please
            contact us immediately.
          </p>
        </div>

        {/* Section 8 */}
        <div className="privacy-section">
          <h2>8. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            for such transfers in compliance with applicable data protection
            laws.
          </p>
        </div>

        {/* Section 9 */}
        <div className="privacy-section">
          <h2>9. Policy Updates</h2>
          <p>
            We may update this privacy policy periodically. We will notify you
            of significant changes by posting the new policy on this page and
            updating the "Last Updated" date.
          </p>
        </div>

        {/* Contact Section */}
        <div className="privacy-contact">
          <FaEnvelope className="contact-icon" />
          <h3>Contact Us</h3>
          <p>
            If you have any questions or concerns about our privacy practices,
            please contact our Data Protection Officer:
          </p>
          <div className="contact-details">
            <p>
              <strong>Email:</strong> privacy@picsprism.com
            </p>
            <p>
              <strong>Phone:</strong> +91-XXX-XXXXXXX
            </p>
            <p>
              <strong>Address:</strong> 123 Business Street, Mumbai, Maharashtra
              400001
            </p>
          </div>
          <div className="response-time">
            We aim to respond to all privacy-related inquiries within 7 business
            days.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
