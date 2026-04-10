import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faRefresh,
  faImage,
  faTags,
  faPercentage,
  faFolderOpen,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faUpload,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import './CategoryManagement.css';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({
    id: null,
    name: '',
    image: null,
    discount: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 items per page for admin view

  const API_URL = 'http://localhost:5000/api/categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
    setCurrentPage(1); // Reset to first page when search changes
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.discount.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleInputChange = (e) => {
    setCategoryData({ ...categoryData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setImageError(
          'Please select a valid image file (JPEG, PNG, GIF, WebP)'
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        return;
      }

      setImageError('');
      setCategoryData({ ...categoryData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!categoryData.name.trim()) {
      setError('Category name is required');
      return false;
    }

    if (!categoryData.id && !categoryData.image && !previewImage) {
      setError('Please select an image for the category');
      return false;
    }

    if (imageError) {
      setError(imageError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!categoryData.name) {
      setError('Category name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('discount', categoryData.discount);
    if (categoryData.image) formData.append('image', categoryData.image);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        categoryData.id ? `${API_URL}/${categoryData.id}` : API_URL,
        {
          method: categoryData.id ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(
        categoryData.id
          ? 'Category updated successfully'
          : 'Category added successfully'
      );

      fetchCategories();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setCategoryData({
      id: category._id,
      name: category.name,
      discount: category.discount,
      image: null,
    });
    setPreviewImage(`http://localhost:5000${category.imageUrl}`);
    setImageError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setSuccess('Category deleted successfully');
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setCategoryData({ id: null, name: '', image: null, discount: '' });
    setPreviewImage(null);
    setImageError('');
  };

  const getDiscountColor = (discount) => {
    if (discount.toLowerCase().includes('off') || discount.includes('%')) {
      return '#10b981'; // Green for discounts
    }
    return '#3b82f6'; // Blue for other offers
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="category-management-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faTags} className="title-icon" />
            Category <span className="highlight">Management</span>
          </h1>
          <p className="page-subtitle">
            Manage product categories, images, and discounts
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f620' }}>
              <FontAwesomeIcon
                icon={faFolderOpen}
                style={{ color: '#3b82f6' }}
              />
            </div>
            <div className="stat-info">
              <span className="stat-count">{categories.length}</span>
              <span className="stat-label">Total Categories</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b98120' }}>
              <FontAwesomeIcon
                icon={faPercentage}
                style={{ color: '#10b981' }}
              />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {
                  categories.filter(
                    (cat) => cat.discount && cat.discount.includes('%')
                  ).length
                }
              </span>
              <span className="stat-label">With Discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="message-icon"
          />
          <span className="message-text">{error}</span>
          <button className="message-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <FontAwesomeIcon icon={faCheckCircle} className="message-icon" />
          <span className="message-text">{success}</span>
          <button className="message-close" onClick={() => setSuccess(null)}>
            ×
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={categoryData.id ? faEdit : faPlus} />
            {categoryData.id ? ' Edit Category' : ' Add New Category'}
          </h3>
          <button className="refresh-btn" onClick={fetchCategories}>
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-grid">
            {/* Category Name */}
            <div className="form-group">
              <label htmlFor="name">
                <FontAwesomeIcon icon={faTags} /> Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={categoryData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
                className="form-input"
              />
              <div className="input-hint">
                e.g., Electronics, Fashion, Home Decor
              </div>
            </div>

            {/* Discount */}
            <div className="form-group">
              <label htmlFor="discount">
                <FontAwesomeIcon icon={faPercentage} /> Discount Offer
              </label>
              <input
                type="text"
                id="discount"
                name="discount"
                value={categoryData.discount}
                onChange={handleInputChange}
                placeholder="e.g., 20% OFF, Up to 50% off"
                className="form-input"
              />
              <div className="input-hint">Enter discount or special offer</div>
            </div>

            {/* Image Upload */}
            <div className="form-group full-width">
              <label>
                <FontAwesomeIcon icon={faImage} /> Category Image *
              </label>
              <div className="image-upload-container">
                <div
                  className="image-upload-area"
                  onClick={() =>
                    document.getElementById('image-upload').click()
                  }
                >
                  {previewImage ? (
                    <div className="image-preview">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="preview-img"
                      />
                      <div className="preview-overlay">
                        <FontAwesomeIcon icon={faUpload} />
                        <span>Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="upload-icon"
                      />
                      <p className="upload-text">
                        Click to upload category image
                      </p>
                      <p className="upload-subtext">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input"
                  />
                </div>
                {imageError && (
                  <div className="validation-error">
                    <FontAwesomeIcon icon={faTimesCircle} /> {imageError}
                  </div>
                )}
                {previewImage && !imageError && (
                  <div className="validation-success">
                    <FontAwesomeIcon icon={faCheckCircle} /> Image selected
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {categoryData.id ? 'Update Category' : 'Add Category'}
            </button>
            {categoryData.id && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search categories by name or discount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="results-info">
            Showing {filteredCategories.length} of {categories.length}{' '}
            categories
          </div>
        </div>
      </div>

      {/* Categories Grid - Now using User-facing style with 5 per row */}
      <div className="categories-grid-container">
        <div className="section-header">
          <h3>All Categories ({filteredCategories.length})</h3>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories found</h3>
            <p>Try adjusting your search or add a new category</p>
          </div>
        ) : (
          <>
            {/* Categories Grid - 5 items per row */}
            <div className="admin-categories-grid">
              {currentCategories.map((category) => (
                <div className="admin-cat-box" key={category._id}>
                  <div className="admin-cat-image">
                    <img
                      src={`http://localhost:5000${category.imageUrl}`}
                      alt={category.name}
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/300x200/3b82f6/ffffff?text=No+Image';
                      }}
                    />
                    <div
                      className="admin-cat-discount"
                      style={{
                        backgroundColor: getDiscountColor(category.discount),
                      }}
                    >
                      {category.discount}
                    </div>
                    <div className="admin-cat-overlay">
                      <button
                        onClick={() => handleEdit(category)}
                        className="admin-edit-btn"
                        title="Edit category"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(category._id, category.name)
                        }
                        className="admin-delete-btn"
                        title="Delete category"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <div className="admin-cat-info">
                    <h4>{category.name}</h4>
                    <div className="admin-cat-actions">
                      <button
                        onClick={() => handleEdit(category)}
                        className="action-btn edit-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(category._id, category.name)
                        }
                        className="action-btn delete-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  className="pagination-btn prev-btn"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Prev
                </button>

                <div className="page-numbers">
                  {getPageNumbers().map((number) => (
                    <button
                      key={number}
                      className={`page-number ${
                        currentPage === number ? 'active' : ''
                      }`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn next-btn"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
