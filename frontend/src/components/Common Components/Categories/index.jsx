import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate(); // Use navigate for redirection

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedCategories = categories.slice(startIndex, endIndex);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section className="categories" id="categories">
      <h1 className="heading">
        Product <span>Categories</span>
      </h1>

      <div className="box-container">
        {paginatedCategories.map((category) => (
          <div
            className="cat-box"
            key={category._id}
            onClick={() => navigate(`/category/${category._id}`)} // Navigate to CatewiseProducts
          >
            <img
              src={`http://localhost:5000${category.imageUrl}`}
              alt={category.name}
            />
            <h3>{category.name}</h3>
            <strong className="cat-discount">
              {category.discount || 'No discounts available'} OFF
            </strong>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="category-pagination">
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
    </section>
  );
}
