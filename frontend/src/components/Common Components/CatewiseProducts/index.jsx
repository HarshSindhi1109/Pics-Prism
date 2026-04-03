import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import FooterEnd from '../FooterEnd';
import './CatewiseProducts.css';

const CatewiseProducts = () => {
  const { categoryId } = useParams(); // Get categoryId from URL
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/category/${categoryId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/categories/${categoryId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categoryData = await response.json();
        setCategoryName(categoryData.name);
      } catch (err) {
        console.error('Error fetching category:', err);
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((item) => item._id === product._id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/buyer-home/cart');
  };
  return (
    <div>
      <Header />

      <div className="catewise-container">
        <h1 className="catewise-title">
          Products in {categoryName || 'Selected Category'}
        </h1>

        {loading ? (
          <p className="catewise-message">Loading products...</p>
        ) : error ? (
          <p className="catewise-message">Error: {error}</p>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={`http://localhost:5000${product.imageUrl}`}
                  alt={product.name}
                  onError={(e) => (e.target.src = 'fallback-image.jpg')}
                />
                <h3>{product.name}</h3>
                <div className="price">Rs {product.price.toFixed(2)}</div>
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="btn"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-products">No products found in this category.</p>
        )}
      </div>

      <Footer />
      <FooterEnd />
    </div>
  );
};

export default CatewiseProducts;
