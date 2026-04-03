import React from 'react';
import './PaymentMethods.css';
import {
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaMoneyBillWave,
  FaShieldAlt,
} from 'react-icons/fa';

const PaymentMethods = () => {
  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-header">
        <h1>Payment Methods</h1>
        <p>
          We offer multiple secure and convenient payment options to make your
          shopping experience smooth and hassle-free.
        </p>
      </div>

      {/* Payment Options */}
      <div className="payment-grid">
        {/* Card */}
        <div className="payment-card">
          <FaCreditCard className="payment-icon" />
          <h3>Credit / Debit Cards</h3>
          <p>
            We accept Visa, MasterCard, RuPay, and American Express cards.
            Transactions are protected with industry-standard encryption.
          </p>
        </div>

        {/* UPI */}
        <div className="payment-card">
          <FaMobileAlt className="payment-icon" />
          <h3>UPI Payments</h3>
          <p>
            Pay instantly using Google Pay, PhonePe, Paytm, BHIM UPI, and other
            supported UPI apps.
          </p>
        </div>

        {/* Net Banking */}
        <div className="payment-card">
          <FaUniversity className="payment-icon" />
          <h3>Net Banking</h3>
          <p>
            Secure online banking supported by major Indian banks with fast
            confirmation.
          </p>
        </div>

        {/* Wallets */}
        <div className="payment-card">
          <FaMoneyBillWave className="payment-icon" />
          <h3>Wallets</h3>
          <p>
            Use popular digital wallets like Paytm Wallet and Amazon Pay for
            quick checkout.
          </p>
        </div>
      </div>

      {/* Security Section */}
      <div className="payment-security">
        <FaShieldAlt className="security-icon" />
        <h2>100% Secure Payments</h2>
        <p>
          All transactions are protected with SSL encryption and comply with
          PCI-DSS security standards. Your payment details are never stored on
          our servers.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethods;
