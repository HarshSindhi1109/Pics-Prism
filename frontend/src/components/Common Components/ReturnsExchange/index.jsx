import React from 'react';
import './ReturnsExchange.css';
import {
  FaUndoAlt,
  FaExchangeAlt,
  FaClipboardCheck,
  FaClock,
  FaTimesCircle,
  FaTruck,
} from 'react-icons/fa';

const ReturnsExchange = () => {
  return (
    <div className="returns-page">
      {/* Header */}
      <div className="returns-header">
        <h1>Returns & Exchange</h1>
        <p>
          We want you to love what you buy. If something isn’t right, here’s how
          we make returns and exchanges simple and hassle-free.
        </p>
      </div>

      {/* Policy Cards */}
      <div className="returns-grid">
        <div className="returns-card">
          <FaClock className="returns-icon" />
          <h3>Return Window</h3>
          <p>
            Products can be returned or exchanged within <strong>7 days</strong>{' '}
            of delivery, provided they are unused and in original condition.
          </p>
        </div>

        <div className="returns-card">
          <FaClipboardCheck className="returns-icon" />
          <h3>Eligibility</h3>
          <p>
            Items must include original packaging, tags, invoice, and accessories
            to qualify for a return or exchange.
          </p>
        </div>

        <div className="returns-card">
          <FaUndoAlt className="returns-icon" />
          <h3>Easy Returns</h3>
          <p>
            Initiate your return request from <strong>My Orders</strong>. Our team
            will schedule a pickup from your address.
          </p>
        </div>

        <div className="returns-card">
          <FaExchangeAlt className="returns-icon" />
          <h3>Quick Exchange</h3>
          <p>
            Exchange requests are processed faster so you get your replacement
            without unnecessary delays.
          </p>
        </div>
      </div>

      {/* Non-Returnable Section */}
      <div className="non-returnable">
        <FaTimesCircle className="non-returnable-icon" />
        <h2>Non-Returnable Items</h2>
        <p>
          Certain items such as digital products, customized orders, and
          clearance sale items are not eligible for return or exchange.
        </p>
      </div>

      {/* Process Section */}
      <div className="returns-process">
        <h2>How the Process Works</h2>

        <div className="process-steps">
          <div className="step">
            <span>1</span>
            <p>Go to <strong>My Orders</strong> and select the item.</p>
          </div>
          <div className="step">
            <span>2</span>
            <p>Choose return or exchange and submit the reason.</p>
          </div>
          <div className="step">
            <span>3</span>
            <p>Pickup will be scheduled at your address.</p>
          </div>
          <div className="step">
            <span>4</span>
            <p>
              Refund or replacement is processed after inspection.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="returns-footer-note">
        <FaTruck />
        <p>
          Refunds are credited to the original payment method within
          <strong> 5–7 business days</strong> after successful quality check.
        </p>
      </div>
    </div>
  );
};

export default ReturnsExchange;
