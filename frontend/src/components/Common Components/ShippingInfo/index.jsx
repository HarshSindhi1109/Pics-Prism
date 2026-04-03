import React from 'react';
import './ShippingInfo.css';
import {
  FaShippingFast,
  FaMapMarkedAlt,
  FaClock,
  FaBoxOpen,
  FaGlobe,
  FaShieldAlt,
} from 'react-icons/fa';

const ShippingInfo = () => {
  return (
    <div className="shipping-page">
      {/* Header */}
      <div className="shipping-header">
        <h1>Shipping Information</h1>
        <p>
          Learn about our shipping process, delivery timelines, and coverage
          areas to ensure a smooth shopping experience.
        </p>
      </div>

      {/* Shipping Details */}
      <div className="shipping-grid">
        <div className="shipping-card">
          <FaShippingFast className="shipping-icon" />
          <h3>Fast & Reliable Delivery</h3>
          <p>
            Orders are processed within 24–48 hours and shipped using trusted
            courier partners for safe and timely delivery.
          </p>
        </div>

        <div className="shipping-card">
          <FaClock className="shipping-icon" />
          <h3>Estimated Delivery Time</h3>
          <p>
            Metro cities: 2–4 business days<br />
            Other regions: 4–7 business days
          </p>
        </div>

        <div className="shipping-card">
          <FaMapMarkedAlt className="shipping-icon" />
          <h3>Tracking Your Order</h3>
          <p>
            Once shipped, a tracking link will be shared via email and your
            account dashboard for real-time updates.
          </p>
        </div>

        <div className="shipping-card">
          <FaGlobe className="shipping-icon" />
          <h3>Shipping Locations</h3>
          <p>
            We currently ship across India. International shipping will be
            available soon.
          </p>
        </div>
      </div>

      {/* Packaging & Safety */}
      <div className="shipping-safety">
        <div className="safety-content">
          <FaBoxOpen className="safety-icon" />
          <h2>Secure Packaging</h2>
          <p>
            Every product is carefully packed using protective materials to
            prevent damage during transit.
          </p>
        </div>

        <div className="safety-content">
          <FaShieldAlt className="safety-icon" />
          <h2>Safe & Insured Shipping</h2>
          <p>
            All shipments are insured to ensure complete peace of mind in case
            of loss or damage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
