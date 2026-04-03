// src/components/Admin Components/AddVendorUsers/index.jsx
// Admin Seller Approval / Rejection UI

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faCheck,
  faTimes,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import './AddVendorUsers.css';

const API_URL = 'http://localhost:5000/api/seller';

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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setSellers(data);
    } catch (err) {
      console.error('Failed to fetch sellers', err);
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = (sellerId) => {
    updateStatus(sellerId, 'approved');
  };

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
          <FontAwesomeIcon icon={faSpinner} spin /> Loading sellers...
        </div>
      ) : sellers.length === 0 ? (
        <p className="empty-text">No pending seller requests</p>
      ) : (
        <div className="vendors-list">
          {sellers.map((seller) => (
            <div key={seller._id} className="list-item seller-card">
              <FontAwesomeIcon icon={faStore} className="icon" />

              <div className="seller-info">
                <p style={{ textTransform: 'capitalize' }}>
                  <strong>Name:</strong> {seller.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {seller.user?.email}
                </p>
                <p>
                  <strong>Business Type:</strong> {seller.businessType}
                </p>
                <p>
                  <strong>GST:</strong> {seller.gstNumber || 'N/A'}
                </p>
                <p>
                  <strong>Certificate</strong>{' '}
                  {seller.licenseImageUrl ? (
                    <button
                      className="view-doc-btn"
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:5000${seller.licenseImageUrl}`
                        )
                      }
                    >
                      View
                    </button>
                  ) : (
                    'Not Uploaded'
                  )}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="pending">Pending</span>
                </p>
              </div>

              <div className="item-actions">
                <button
                  className="approve-btn"
                  disabled={actionLoading === seller._id}
                  onClick={() => approveSeller(seller._id)}
                >
                  <FontAwesomeIcon icon={faCheck} /> Approve
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

      {showRejectModal && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <h2>Reject Seller Application</h2>

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
