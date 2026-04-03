import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import SwiperCore, { Autoplay } from 'swiper';
import './Reviews.css';
import 'swiper/swiper.min.css';
import { jwtDecode } from 'jwt-decode';

SwiperCore.use([Autoplay]);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [products, setProducts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Track products already reviewed by logged-in user
  const [reviewedProducts, setReviewedProducts] = useState({});

  const [newReview, setNewReview] = useState({
    review: '',
    rating: 0,
    product: null,
    imageFile: null,
  });

  const [myReviews, setMyReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    review: '',
    rating: 0,
    imageFile: null,
    imagePreview: null,
  });

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const dropdownRef = useRef();
  const userId = decoded?.id; // must exist after login
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchReviews();
    if (userId) {
      fetchMyReviews();
    }
  }, [userId]);

  // FETCH REVIEWS
  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);

      // Build map of products reviewed by this user
      const reviewedMap = {};
      data.reviews.forEach((r) => {
        if (r.user?.toString() === userId) {
          reviewedMap[r.product._id.toString()] = true;
        }
      });
      setReviewedProducts(reviewedMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyReviews = async () => {
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/reviews/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMyReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Dropdown outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleRatingChange = (e) => {
    const value = parseFloat(e.target.value);
    setNewReview({ ...newReview, rating: isNaN(value) ? 0 : value });
  };

  const handleFileChange = (e) => {
    setNewReview({ ...newReview, imageFile: e.target.files[0] });
  };

  const handleProductSelect = (productId) => {
    setNewReview({ ...newReview, product: productId });
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.product) {
      return alert('Please select a product');
    }

    if (reviewedProducts[newReview.product]) {
      return alert('You have already reviewed this product');
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('review', newReview.review);
      formData.append('rating', newReview.rating);
      formData.append('product', newReview.product);
      if (newReview.imageFile) {
        formData.append('imageFile', newReview.imageFile);
      }

      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit review');
        return;
      }

      setSubmitError(null);
      setNewReview({ review: '', rating: 0, product: null, imageFile: null });
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateReview = async (id) => {
    try {
      const formData = new FormData();
      formData.append('review', editReviewData.review);
      formData.append('rating', editReviewData.rating);

      if (editReviewData.imageFile) {
        formData.append('imageFile', editReviewData.imageFile);
      }

      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update review');

      setEditingReviewId(null);
      fetchMyReviews();
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;

    try {
      await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchMyReviews();
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  const alreadyReviewed = newReview.product
    ? reviewedProducts[newReview.product]
    : false;

  return (
    <section className="reviews">
      <h1 className="heading">
        customer&apos;s <span>reviews</span>
      </h1>

      {/* Reviews Slider */}
      <div className="reviews-slider">
        <Swiper
          loop
          autoplay={{ delay: 7500, disableOnInteraction: false }}
          slidesPerView={3}
          centeredSlides
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {reviews.map((review) => (
            <SwiperSlide key={review._id}>
              <div className="review-card">
                {review.imageUrl && (
                  <img
                    src={review.imageUrl}
                    alt={review.name}
                    className="review-image"
                  />
                )}

                <p className="product-name">{review.product?.name}</p>

                <p className="review-text">{review.review}</p>
                <h3>{review.name}</h3>

                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((i) =>
                    review.rating >= i ? (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ) : review.rating >= i - 0.5 ? (
                      <FontAwesomeIcon key={i} icon={faStarHalfAlt} />
                    ) : null
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Review Form */}
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="review-form">
          <h2>Add Your Review</h2>

          {/* Product Dropdown */}
          <div
            className={`dropdown ${dropdownOpen ? 'dropdown-open' : ''}`}
            ref={dropdownRef}
          >
            <div
              className="dropdown-selected"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {newReview.product
                ? products.find((p) => p._id === newReview.product)?.name
                : 'Select Product'}
              <span style={{ marginLeft: 'auto' }}>▼</span>
            </div>

            <ul className="dropdown-list">
              {products.map((p) => (
                <li key={p._id} onClick={() => handleProductSelect(p._id)}>
                  {p.name}
                </li>
              ))}
            </ul>
          </div>

          {alreadyReviewed && (
            <p className="error-text" style={{ color: 'red' }}>
              You have already reviewed this product.
            </p>
          )}

          <textarea
            name="review"
            value={newReview.review}
            onChange={handleInputChange}
            placeholder="Write your review"
            required
            disabled={alreadyReviewed}
          />

          <div className="stars-rating">
            <label style={{ fontSize: '1.4rem' }}>Rating:</label>
            <input
              type="number"
              name="rating"
              value={newReview.rating}
              onChange={handleRatingChange}
              min="0.5"
              max="5"
              step="0.5"
              required
              disabled={alreadyReviewed}
            />
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            disabled={alreadyReviewed}
          />

          {submitError && (
            <p
              className="error-text"
              style={{ color: 'red', marginBottom: '10px' }}
            >
              {submitError}
            </p>
          )}

          <button type="submit" className="btn" disabled={alreadyReviewed}>
            Submit Review
          </button>
        </form>
      )}

      {isLoggedIn && myReviews.length > 0 && (
        <div className="my-reviews-section">
          <h2 className="my-reviews-heading">My Reviews</h2>

          <table className="my-reviews-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {myReviews.map((review) => (
                <tr key={review._id}>
                  <td>
                    {editingReviewId === review._id ? (
                      <>
                        {editReviewData.imagePreview && (
                          <img
                            src={editReviewData.imagePreview}
                            alt="preview"
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              marginBottom: '6px',
                            }}
                          />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEditReviewData({
                                ...editReviewData,
                                imageFile: file,
                                imagePreview: URL.createObjectURL(file),
                              });
                            }
                          }}
                        />
                      </>
                    ) : review.imageUrl ? (
                      <img
                        src={review.imageUrl}
                        alt="review"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>{review.product?.name}</td>

                  <td>
                    {editingReviewId === review._id ? (
                      <textarea
                        value={editReviewData.review}
                        onChange={(e) =>
                          setEditReviewData({
                            ...editReviewData,
                            review: e.target.value,
                          })
                        }
                      />
                    ) : (
                      review.review
                    )}
                  </td>

                  <td>
                    {editingReviewId === review._id ? (
                      <input
                        type="number"
                        min="0.5"
                        max="5"
                        step="0.5"
                        value={editReviewData.rating}
                        onChange={(e) =>
                          setEditReviewData({
                            ...editReviewData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                      />
                    ) : (
                      review.rating
                    )}
                  </td>

                  <td>
                    {editingReviewId === review._id ? (
                      <>
                        <button
                          className="review-save-btn" // Changed from "btn" to "save-btn"
                          onClick={() => handleUpdateReview(review._id)}
                        >
                          Save
                        </button>
                        <button
                          className="review-cancel-btn"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="review-edit-btn"
                          onClick={() => {
                            setEditingReviewId(review._id);
                            setEditReviewData({
                              review: review.review,
                              rating: review.rating,
                              imageFile: null,
                              imagePreview: review.imagePreview || null,
                            });
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="review-delete-btn"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
