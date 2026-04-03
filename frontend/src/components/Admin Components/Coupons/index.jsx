import React, { useEffect, useState } from 'react';
import './Coupons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faPercent,
  faMoneyBill,
  faToggleOn,
  faToggleOff,
  faCalendar,
  faTag,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discountTypeOpen, setDiscountTypeOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiryDate: '',
  });

  const token = localStorage.getItem('token');

  /* ================= FETCH COUPONS ================= */
  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupon/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= CREATE COUPON ================= */
  const createCoupon = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/coupon/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert('✅ Coupon created successfully');
      setForm({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        expiryDate: '',
      });

      fetchCoupons();
    } catch {
      alert('❌ Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE COUPON ================= */
  const toggleCoupon = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/coupon/toggle/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to toggle coupon');
        return;
      }

      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE COUPON ================= */
  const deleteCoupon = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this coupon? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/coupon/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete coupon');
        return;
      }

      alert('🗑️ Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('❌ Error deleting coupon');
    }
  };

  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  const discountTypeOptions = [
    { value: 'PERCENT', label: 'Percentage', icon: faPercent },
    { value: 'FLAT', label: 'Flat Amount', icon: faMoneyBill },
  ];

  const getDiscountTypeIcon = (type) => {
    const option = discountTypeOptions.find((opt) => opt.value === type);
    return option ? option.icon : faPercent;
  };

  const getDiscountTypeLabel = (type) => {
    const option = discountTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : 'Percentage';
  };

  return (
    <section className="coupons-admin">
      <div className="coupons-header-section">
        <div className="coupons-header-content">
          <h1>
            Coupons & <span className="highlight">Offers</span>
          </h1>
          <p className="coupons-page-subtitle">
            Create and manage discount coupons for your store
          </p>
        </div>
      </div>

      {/* ================= CREATE FORM ================= */}
      <form className="coupon-form" onSubmit={createCoupon}>
        <div className="coupon-form-header">
          <h3>
            <FontAwesomeIcon icon={faTag} />
            {loading ? ' Creating Coupon...' : ' Create New Coupon'}
          </h3>
        </div>

        <div className="coupon-form-grid">
          <div className="coupon-form-group">
            <label htmlFor="code">
              Coupon Code <span className="coupon-required">*</span>
            </label>
            <input
              type="text"
              id="code"
              placeholder="SUMMER25"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              className="coupon-form-input"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="coupon-form-group">
            <label htmlFor="discountType">
              Discount Type <span className="coupon-required">*</span>
            </label>
            <div className="coupon-custom-select-container">
              <div
                className={`coupon-custom-select ${
                  discountTypeOpen ? 'open' : ''
                }`}
                onClick={() => setDiscountTypeOpen(!discountTypeOpen)}
              >
                <div className="coupon-selected-value">
                  <FontAwesomeIcon
                    icon={getDiscountTypeIcon(form.discountType)}
                  />
                  {getDiscountTypeLabel(form.discountType)}
                  <FontAwesomeIcon
                    icon={discountTypeOpen ? faChevronUp : faChevronDown}
                    className="coupon-dropdown-arrow"
                  />
                </div>

                {discountTypeOpen && (
                  <ul className="coupon-select-dropdown">
                    {discountTypeOptions.map((option) => (
                      <li
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, discountType: option.value });
                          setDiscountTypeOpen(false);
                        }}
                        className={
                          form.discountType === option.value ? 'selected' : ''
                        }
                      >
                        <FontAwesomeIcon icon={option.icon} />
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="coupon-form-group">
            <label htmlFor="discountValue">
              Discount Value <span className="coupon-required">*</span>
            </label>
            <input
              type="number"
              id="discountValue"
              placeholder={
                form.discountType === 'PERCENT' ? 'e.g., 25' : 'e.g., 500'
              }
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              required
              className="coupon-form-input"
            />
            <div className="coupon-input-hint">
              {form.discountType === 'PERCENT'
                ? 'Percentage (e.g., 25 for 25%)'
                : 'Flat amount in ₹'}
            </div>
          </div>

          <div className="coupon-form-group">
            <label htmlFor="minOrderAmount">
              Minimum Order <span className="coupon-required">*</span>
            </label>
            <input
              type="number"
              id="minOrderAmount"
              placeholder="e.g., 1000"
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm({ ...form, minOrderAmount: e.target.value })
              }
              required
              className="coupon-form-input"
            />
          </div>

          <div className="coupon-form-group">
            <label htmlFor="maxDiscount">Max Discount (Optional)</label>
            <input
              type="number"
              id="maxDiscount"
              placeholder={
                form.discountType === 'PERCENT' ? 'e.g., 500' : 'Not applicable'
              }
              value={form.maxDiscount}
              onChange={(e) =>
                setForm({ ...form, maxDiscount: e.target.value })
              }
              className="coupon-form-input"
              disabled={form.discountType === 'FLAT'}
            />
            {form.discountType === 'FLAT' && (
              <div className="coupon-input-hint">
                Not applicable for flat discounts
              </div>
            )}
          </div>

          <div className="coupon-form-group">
            <label htmlFor="expiryDate">
              Expiry Date <span className="coupon-required">*</span>
            </label>
            <div className="coupon-date-input-container">
              <FontAwesomeIcon icon={faCalendar} className="coupon-date-icon" />
              <input
                type="date"
                id="expiryDate"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
                required
                className="coupon-form-input"
              />
            </div>
          </div>
        </div>

        <div className="coupon-form-actions">
          <button
            type="submit"
            className="coupon-btn-submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>

      {/* ================= COUPONS TABLE ================= */}
      <div className="coupon-table-card">
        <div className="coupon-card-header">
          <h3>Active Coupons ({coupons.length})</h3>
        </div>

        <div className="coupon-table-container">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((c) => {
                const expired = isExpired(c.expiryDate);
                const usable = c.isActive && !expired;

                return (
                  <tr
                    key={c._id}
                    className={!c.isActive ? 'coupon-inactive-row' : ''}
                  >
                    <td className="coupon-code">
                      <div className="coupon-code-badge">{c.code}</div>
                    </td>
                    <td className="coupon-type">
                      <span className="coupon-type-badge coupon-type-percent">
                        <FontAwesomeIcon
                          icon={getDiscountTypeIcon(c.discountType)}
                        />
                        {c.discountType === 'PERCENT' ? 'Percentage' : 'Flat'}
                      </span>
                    </td>
                    <td className="coupon-value">
                      <div className="coupon-value-display">
                        {c.discountType === 'PERCENT' ? (
                          <>
                            <span className="coupon-value">
                              {c.discountValue}
                            </span>
                            <span className="coupon-unit">%</span>
                            {c.maxDiscount && (
                              <div className="coupon-max-discount">
                                Max: ₹{c.maxDiscount}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="coupon-value">
                              ₹{c.discountValue}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="coupon-min-order">
                      <div className="coupon-amount">₹{c.minOrderAmount}</div>
                    </td>
                    <td className="coupon-expiry-date">
                      <div
                        className={`coupon-date-display ${
                          expired ? 'expired' : ''
                        }`}
                      >
                        <FontAwesomeIcon icon={faCalendar} />
                        {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {/* ✅ Show expired badge */}
                        {expired && (
                          <span className="coupon-expired-badge">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="coupon-status-cell">
                      <span
                        className={`coupon-status-badge ${
                          usable ? 'active' : 'inactive'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={c.isActive ? faToggleOn : faToggleOff}
                        />
                        {expired
                          ? 'Expired'
                          : c.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>
                    <td className="coupon-actions-cell">
                      <div className="coupon-action-group">
                        <button
                          onClick={() => toggleCoupon(c._id)}
                          className={`coupon-action-btn coupon-toggle-btn ${
                            c.isActive ? 'disable' : 'enable'
                          }`}
                          disabled={expired}
                          title={expired ? 'Cannot enable expired coupon' : ''}
                        >
                          {c.isActive ? 'Diable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => deleteCoupon(c._id)}
                          className="coupon-action-btn coupon-delete-btn"
                          title="Delete coupon"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {coupons.length === 0 && (
            <div className="coupon-empty-state">
              <div className="coupon-empty-icon">🎫</div>
              <h3>No coupons found</h3>
              <p>Create your first coupon to get started</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
