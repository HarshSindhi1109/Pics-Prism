import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faStarHalfAlt,
  faStar as faStarEmpty,
} from '@fortawesome/free-solid-svg-icons';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] =
    useState('Select Categories');
  const [wishlist, setWishlist] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4; // change if needed

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    };

    const fetchCategories = async () => {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(data);
    };

    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setWishlist(data?.products || []);
    };

    fetchProducts();
    fetchCategories();
    fetchWishlist();
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category._id);
    setSelectedCategoryName(category.name);
    setFilteredProducts(products.filter((p) => p.category === category._id));
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  const resetCategory = () => {
    setSelectedCategory('');
    setSelectedCategoryName('Select Categories');
    setFilteredProducts(products);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find((i) => i._id === product._id);
    existing
      ? (existing.quantity += 1)
      : cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    role === 'seller'
      ? navigate('/seller-home/cart')
      : navigate('/buyer-home/cart');
  };

  const toggleWishlist = async (productId) => {
    const token = localStorage.getItem('token');

    const isWishlisted = wishlist.some((i) => i._id === productId);
    const url = isWishlisted
      ? 'http://localhost:5000/api/wishlist/remove'
      : 'http://localhost:5000/api/wishlist/add';

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }), // 🔥 REMOVE userId
    });

    setWishlist((prev) =>
      isWishlisted
        ? prev.filter((p) => p._id !== productId)
        : [...prev, { _id: productId }]
    );
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const isOwnProduct = (product) => {
    return role === 'seller' && product.seller === userId;
  };

  const renderStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} />);
      } else {
        stars.push(
          <FontAwesomeIcon key={i} icon={faStar} className="empty-star" />
        );
      }
    }

    return stars;
  };
  return (
    <div className="products">
      <h1 className="heading">
        Our <span>Products</span>
      </h1>

      {/* ===== Custom Dropdown ===== */}
      <div className="category-filter" ref={dropdownRef}>
        <span className="category-drop-title">Filter by Category</span>

        <div
          className={`custom-select ${isDropdownOpen ? 'open' : ''}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="select-box">
            {selectedCategoryName}
            <span className="arrow">▾</span>
          </div>

          {isDropdownOpen && (
            <ul className="select-options">
              <li onClick={resetCategory}>All Categories</li>
              {categories.map((cat) => (
                <li key={cat._id} onClick={() => handleCategorySelect(cat)}>
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ===== Products ===== */}
      <div className="products-main">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            className={`productmain-card ${
              product.stock === 0 ? 'out-of-stock' : ''
            }`}
          >
            <div
              className="image-container"
              onClick={() => navigate(`/buyer-home/product/${product._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`http://localhost:5000${product.imageUrl}`}
                alt={product.name}
              />
            </div>

            <div className="product-info">
              <h3>{product.name}</h3>
              <p>
                Category:{' '}
                {categories.find((c) => c._id === product.category)?.name ||
                  'Unknown'}
              </p>
              <div className="price">Rs {product.price}</div>
              {product.numOfReviews > 0 ? (
                <div className="rating-box">
                  <div className="stars">{renderStars(product.ratings)}</div>
                  <span>
                    {product.ratings.toFixed(1)} ({product.numOfReviews}{' '}
                    reviews)
                  </span>
                </div>
              ) : (
                <div className="no-reviews">No reviews yet</div>
              )}
            </div>

            <div className="product-actions">
              <button
                className="btn"
                disabled={product.stock === 0 || isOwnProduct(product)}
                onClick={() => {
                  if (isOwnProduct(product)) {
                    alert("❌ You can't purchase your own product");
                    return;
                  }
                  addToCart(product);
                }}
              >
                {isOwnProduct(product)
                  ? 'Your Product'
                  : product.stock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
              {role === 'buyer' && (
                <button
                  className={`wishlist-btn ${
                    wishlist.some((i) => i._id === product._id)
                      ? 'wishlisted'
                      : ''
                  }`}
                  onClick={() => toggleWishlist(product._id)}
                >
                  ❤
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
