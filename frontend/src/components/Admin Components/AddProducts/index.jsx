import React, { useState, useEffect } from 'react';
import './AddProducts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import { useLocation } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState(''); // ← moderation error message
  const [submitting, setSubmitting] = useState(false); // ← prevent double submit

  const ITEMS_PER_PAGE = 10;

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null,
  });

  const [editingProduct, setEditingProduct] = useState(null);

  const location = useLocation();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/products/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load products');
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Failed to fetch categories');

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (location.state?.productId && products.length > 0) {
      const productToEdit = products.find(
        (p) => p._id === location.state.productId
      );
      if (productToEdit) handleEditProduct(productToEdit);
    }
  }, [location.state, products]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormError(''); // clear error on any change
    if (type === 'file') {
      setNewProduct({ ...newProduct, image: files[0] });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('stock', newProduct.stock);
      if (newProduct.image) formData.append('image', newProduct.image);

      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // 🔴 Show moderation / validation error inline instead of alert
        setFormError(data.error || 'Failed to save product');
        return;
      }

      setProducts((prev) =>
        editingProduct
          ? prev.map((p) => (p._id === data._id ? data : p))
          : [...prev, data]
      );

      resetForm();
      alert(editingProduct ? 'Product updated!' : 'Product added!');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Delete failed');
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormError('');
    setNewProduct({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price?.toString() ?? '',
      stock: product.stock?.toString() ?? '',
      category: product.category?.toString() ?? '',
      image: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormError('');
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: null,
    });
  };

  const filteredProducts = products.filter((product) => {
    const productName = product.name.toLowerCase();
    const categoryName =
      categories.find((c) => c._id === product.category)?.name.toLowerCase() ||
      '';
    return (
      productName.includes(searchTerm.toLowerCase()) ||
      categoryName.includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="products" id="products">
      <h1 className="heading">
        Manage <span>Products</span>
      </h1>

      {/* Add / Edit Form */}
      <form onSubmit={handleAddOrUpdateProduct} className="add-product-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
          required
        />

        <div className="quill-wrapper">
          <ReactQuill
            theme="snow"
            value={newProduct.description}
            onChange={(value) => {
              setFormError('');
              setNewProduct((prev) => ({ ...prev, description: value }));
            }}
            placeholder="Write product description here..."
          />
        </div>

        <input
          type="number"
          name="price"
          placeholder="Price"
          min={0}
          value={newProduct.price}
          onChange={handleInputChange}
          required
        />

        <input
          type="file"
          name="image"
          onChange={handleInputChange}
          required={!editingProduct}
        />

        {/* 🔴 Inline moderation / error message */}
        {formError && (
          <p
            style={{
              color: '#b91c1c',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '0.6rem',
              padding: '0.8rem 1rem',
              fontSize: '1.3rem',
              margin: '0.5rem 0',
            }}
          >
            ⚠️ {formError}
          </p>
        )}

        <div
          className={`custom-select ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="selected-value">
            {categories.find((c) => c._id === newProduct.category)?.name ||
              'Select Category'}
            <span className="arrow">▼</span>
          </div>

          {dropdownOpen && (
            <ul className="options-list">
              {categories.length === 0 && (
                <li className="option disabled">No categories</li>
              )}
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  className="option"
                  onClick={() => {
                    setNewProduct((prev) => ({ ...prev, category: cat._id }));
                    setDropdownOpen(false);
                  }}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          min="0"
          value={newProduct.stock}
          onChange={handleInputChange}
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting
              ? 'Checking image...'
              : editingProduct
              ? 'Update Product'
              : 'Add Product'}
          </button>

          {editingProduct && (
            <button
              type="button"
              className="cancel-change-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search Bar */}
      <div className="table-search">
        <input
          type="text"
          placeholder="Search by product name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products available. Add your first product 🚀</p>
        </div>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Products Found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={`http://localhost:5000${product.imageUrl}`}
                        alt={product.name}
                        className="table-image"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td className="price">₹ {product.price}</td>
                    <td>
                      {categories.find((c) => c._id === product.category)
                        ?.name || 'Unknown'}
                    </td>
                    <td>
                      <span
                        className={`stock ${
                          product.stock > 0 ? 'in-stock' : 'out-stock'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="product-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditProduct(product)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="product-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
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
      )}
    </section>
  );
}
