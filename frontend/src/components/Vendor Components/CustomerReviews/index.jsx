import React, { useEffect, useState } from 'react';
import './CustomerReviews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reviews/seller', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load reviews');

        setReviews(data.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading) return <p className="text-center">Loading reviews…</p>;
  if (error) return <p className="text-center error-text">{error}</p>;

  return (
    <div className="customer-reviews-container">
      <h1 className="heading">
        Customer <span>Reviews</span>
      </h1>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <FontAwesomeIcon icon={faComments} className="no-reviews-icon" />
          <h2>No Customer Reviews Yet</h2>
          <p>When customers review your products, they will appear here.</p>
        </div>
      ) : (
        <div className="reviews-table-wrapper">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td className="product-name">{r.product?.name}</td>
                  <td>{r.displayName}</td>
                  <td className="review-text">{r.review}</td>
                  <td className="rating-cell">{r.rating} ⭐</td>
                  <td className="date-cell">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
