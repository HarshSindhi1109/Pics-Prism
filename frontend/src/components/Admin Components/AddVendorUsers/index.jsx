// src/components/Admin Components/AddVendorUsers/index.jsx
// Admin Seller Approval / Rejection UI — Full Details View

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faCheck,
  faTimes,
  faSpinner,
  faChevronDown,
  faChevronUp,
  faUser,
  faMapMarkerAlt,
  faUniversity,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import './AddVendorUsers.css';

const API_URL = 'http://localhost:5000/api/seller';

// Reusable info row
const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || 'N/A'}</span>
  </div>
);

// Collapsible section
const Section = ({ icon, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`detail-section ${open ? 'open' : ''}`}>
      <button className="section-header" onClick={() => setOpen(!open)}>
        <span className="section-title">
          <FontAwesomeIcon icon={icon} className="section-icon" />
          {title}
        </span>
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className="chevron"
        />
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

export default function AddVendorUsers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      const res = await fetch(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setSellers(data);
    } catch (err) {
      console.error('Failed to fetch sellers', err);
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = (sellerId) => updateStatus(sellerId, 'approved');

  const openRejectModal = (sellerId) => {
    setSelectedSellerId(sellerId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const updateStatus = async (sellerId, status, reason = '') => {
    try {
      setActionLoading(sellerId);
      const res = await fetch(`${API_URL}/${sellerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || 'Action failed');
        return;
      }
      setSellers((prev) => prev.filter((s) => s._id !== sellerId));
      setShowRejectModal(false);
    } catch (err) {
      console.error(err);
      alert('Server error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="users-vendors-management">
      <h1 className="heading">
        Seller <span>Approval Requests</span>
      </h1>

      {loading ? (
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          Loading sellers...
        </div>
      ) : sellers.length === 0 ? (
        <p className="empty-text">No pending seller requests</p>
      ) : (
        <div className="vendors-list">
          {sellers.map((seller) => (
            <div key={seller._id} className="seller-card">
              {/* ── Card Header ── */}
              <div className="card-header">
                <div className="card-header-left">
                  <div className="store-avatar">
                    <FontAwesomeIcon icon={faStore} />
                  </div>
                  <div>
                    <h3 className="store-name">{seller.storeName}</h3>
                    <span className="business-type-badge">
                      {seller.businessType}
                    </span>
                  </div>
                </div>
                <span className="status-badge pending">Pending</span>
              </div>

              {/* ── Section 1: Basic Info (always visible) ── */}
              <Section
                icon={faUser}
                title="Basic Information"
                defaultOpen={true}
              >
                <InfoRow label="Owner Name" value={seller.user?.name} />
                <InfoRow label="Email" value={seller.user?.email} />
                <InfoRow label="Store Name" value={seller.storeName} />
                <InfoRow label="Business Type" value={seller.businessType} />
                <InfoRow label="GST Number" value={seller.gstNumber} />
                <InfoRow label="PAN Number" value={seller.panNumber} />
                <div className="info-row">
                  <span className="info-label">Certificate</span>
                  <span className="info-value">
                    {seller.licenseImageUrl ? (
                      <button
                        className="view-doc-btn"
                        onClick={() =>
                          setPreviewImage(
                            `http://localhost:5000${seller.licenseImageUrl}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faFileAlt} /> View Document
                      </button>
                    ) : (
                      'Not Uploaded'
                    )}
                  </span>
                </div>
              </Section>

              {/* ── Section 2: Address ── */}
              <Section icon={faMapMarkerAlt} title="Address Details">
                <InfoRow label="Address Line" value={seller.address?.line1} />
                <InfoRow label="City" value={seller.address?.city} />
                <InfoRow label="State" value={seller.address?.state} />
                <InfoRow label="Pincode" value={seller.address?.pincode} />
                <InfoRow label="Country" value={seller.address?.country} />
              </Section>

              {/* ── Section 3: Bank Details ── */}
              <Section icon={faUniversity} title="Bank Details">
                <InfoRow
                  label="Account Holder"
                  value={seller.bankDetails?.accountHolderName}
                />
                <InfoRow
                  label="Bank Name"
                  value={seller.bankDetails?.bankName}
                />
                <InfoRow
                  label="Account Number"
                  value={
                    seller.bankDetails?.accountNumber
                      ? '••••' + seller.bankDetails.accountNumber.slice(-4)
                      : null
                  }
                />
                <InfoRow
                  label="IFSC Code"
                  value={seller.bankDetails?.ifscCode}
                />
                <InfoRow label="UPI ID" value={seller.bankDetails?.upiId} />
              </Section>

              {/* ── Actions ── */}
              <div className="item-actions">
                <button
                  className="approve-btn"
                  disabled={actionLoading === seller._id}
                  onClick={() => approveSeller(seller._id)}
                >
                  {actionLoading === seller._id ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} />
                  )}
                  Approve
                </button>
                <button
                  className="reject-btn"
                  disabled={actionLoading === seller._id}
                  onClick={() => openRejectModal(seller._id)}
                >
                  <FontAwesomeIcon icon={faTimes} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Certificate Preview Modal ── */}
      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage(null)}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Seller Certificate" />
            <div className="modal-actions">
              <a
                className="open-new-btn"
                href={previewImage}
                target="_blank"
                rel="noreferrer"
              >
                Open in new tab
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ── */}
      {showRejectModal && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <h2>Reject Seller Application</h2>
            <p className="reject-modal-sub">
              This reason will be emailed to the applicant.
            </p>
            <textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-reject-btn"
                disabled={!rejectionReason.trim()}
                onClick={() =>
                  updateStatus(selectedSellerId, 'rejected', rejectionReason)
                }
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
