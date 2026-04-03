import React, { useState, useEffect, useRef } from 'react';
import './ContactUs.css';
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHeadset,
  FaStore,
  FaPaperPlane,
} from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const subjects = [
    'Order Issue',
    'Payment Issue',
    'Return / Refund',
    'Seller Support',
    'Technical Issue',
    'Other',
  ];

  const [openSubject, setOpenSubject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const subjectRef = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) {
        setOpenSubject(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess('Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <FaEnvelope className="contact-header-icon" />
        <h1>Contact Us</h1>
        <p>
          Need help with an order, payment, or account? Our support team is here
          to assist you.
        </p>
      </div>

      <div className="contact-content">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <div className="info-item">
            <FaHeadset className="info-icon" />
            <div>
              <h4>Customer Support</h4>
              <p>support@picsprism.com</p>
            </div>
          </div>

          <div className="info-item">
            <FaStore className="info-icon" />
            <div>
              <h4>Seller Support</h4>
              <p>sellers@picsprism.com</p>
            </div>
          </div>

          <div className="info-item">
            <FaPhoneAlt className="info-icon" />
            <div>
              <h4>Phone</h4>
              <p>+91-XXX-XXXXXXX</p>
            </div>
          </div>

          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <h4>Office Address</h4>
              <p>
                123 Business Street,
                <br />
                Mumbai, Maharashtra – 400001
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>

          <input
            placeholder="Your Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* SUBJECT DROPDOWN (BecomeSeller style) */}
          <div className="contact-select-dropdown" ref={subjectRef}>
            <div
              className="contact-select-box"
              onClick={() => setOpenSubject(!openSubject)}
            >
              {formData.subject || 'Select Subject'}
              <span className="arrow">▾</span>
            </div>

            {openSubject && (
              <ul className="contact-select-options">
                {subjects.map((sub) => (
                  <li
                    key={sub}
                    onClick={() => {
                      setFormData({ ...formData, subject: sub });
                      setOpenSubject(false);
                    }}
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <textarea
            placeholder="Describe your issue"
            required
            rows="5"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              'Sending...'
            ) : (
              <>
                <FaPaperPlane /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
