import React from 'react';
import './TermsOfService.css';
import {
  FaGavel,
  FaFileContract,
  FaUserShield,
  FaExclamationTriangle,
  FaBalanceScale,
} from 'react-icons/fa';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      {/* Header */}
      <div className="terms-header">
        <FaGavel className="terms-header-icon" />
        <h1>Terms of Service</h1>
        <p>
          Please read these terms carefully before using our services. By
          accessing or using Pics Prism, you agree to be bound by these terms.
        </p>
        <div className="last-updated">Last Updated: April 2024</div>
      </div>

      {/* Main Content */}
      <div className="terms-content">
        {/* Section 1 */}
        <div className="terms-section">
          <FaFileContract className="section-icon" />
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Pics Prism website (the "Service"), you
            accept and agree to be bound by the terms and provisions of this
            agreement. If you do not agree to abide by these terms, please do
            not use this Service.
          </p>
        </div>

        {/* Section 2 */}
        <div className="terms-section">
          <FaUserShield className="section-icon" />
          <h2>2. User Accounts</h2>
          <ul>
            <li>
              You are responsible for maintaining the confidentiality of your
              account and password.
            </li>
            <li>
              You agree to accept responsibility for all activities that occur
              under your account.
            </li>
            <li>
              You must provide accurate and complete information when creating
              an account.
            </li>
            <li>
              We reserve the right to refuse service, terminate accounts, or
              cancel orders at our discretion.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="terms-section">
          <h2>3. Products and Pricing</h2>
          <ul>
            <li>All products are subject to availability.</li>
            <li>
              We reserve the right to discontinue any product at any time.
            </li>
            <li>Prices are subject to change without notice.</li>
            <li>
              We are not responsible for typographical errors regarding price or
              product information.
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="terms-section">
          <h2>4. Orders and Payment</h2>
          <ul>
            <li>
              Your order constitutes an offer to purchase products from us.
            </li>
            <li>
              We reserve the right to accept or decline your order for any
              reason.
            </li>
            <li>Payment must be completed before order processing begins.</li>
            <li>
              We use third-party payment processors and are not responsible for
              their actions.
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="terms-section">
          <h2>5. Shipping and Delivery</h2>
          <ul>
            <li>Delivery times are estimates and not guaranteed.</li>
            <li>
              We are not responsible for delays due to unforeseen circumstances.
            </li>
            <li>Risk of loss passes to you upon delivery to the carrier.</li>
            <li>
              You are responsible for providing accurate shipping information.
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="terms-section">
          <h2>6. Returns and Refunds</h2>
          <ul>
            <li>Returns must be made within 7 days of delivery.</li>
            <li>Products must be in original condition with all packaging.</li>
            <li>Refunds will be issued to the original payment method.</li>
            <li>
              Certain items (digital products, customized orders) are
              non-returnable.
            </li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="terms-section">
          <FaExclamationTriangle className="section-icon warning" />
          <h2>7. Prohibited Uses</h2>
          <p>You agree not to use the Service:</p>
          <ul>
            <li>For any unlawful purpose</li>
            <li>To harass, abuse, or harm others</li>
            <li>To violate any intellectual property rights</li>
            <li>To transmit malware or malicious code</li>
            <li>To collect or track personal information of others</li>
          </ul>
        </div>

        {/* Section 8 */}
        <div className="terms-section">
          <h2>8. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos,
            images, and software, is the property of Pics Prism or its content
            suppliers and is protected by international copyright laws.
          </p>
        </div>

        {/* Section 9 */}
        <div className="terms-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            Pics Prism shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of or inability to use the Service.
          </p>
        </div>

        {/* Section 10 */}
        <div className="terms-section">
          <FaBalanceScale className="section-icon" />
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of India, without regard to its conflict of law provisions.
            Any disputes shall be subject to the exclusive jurisdiction of the
            courts located in Mumbai.
          </p>
        </div>

        {/* Section 11 */}
        <div className="terms-section">
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will
            notify users of any changes by updating the "Last Updated" date.
            Your continued use of the Service after changes constitutes
            acceptance of the new terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="terms-contact">
          <h3>Contact Us</h3>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <p className="contact-details">
            <strong>Email:</strong> legal@picsprism.com
            <br />
            <strong>Address:</strong> 123 Business Street, Mumbai, Maharashtra
            400001
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
