import React, { useState, useEffect } from 'react';
import './Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]); // State to hold blog data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage errors
  const [expandedBlog, setExpandedBlog] = useState(null);
  const DESCRIPTION_LIMIT = 140;

  // Fetch blogs from the API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/blogs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: Rs{response.status}`);
        }
        const data = await response.json();
        setBlogs(data); // Set the blogs data from API
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="blogs" id="blogs">
      <h1 className="heading">
        our <span>blogs</span>
      </h1>
      <div className="blogs-container">
        {blogs.map((blog) => (
          <div className="blog-card" key={blog._id}>
            <div className="blog-image">
              <img
                src={`http://localhost:5000${blog.imageUrl}`}
                alt={blog.title}
              />
            </div>
            <div className="blog-content">
              <h3>{blog.title}</h3>
              <p>
                <strong>Author:</strong> {blog.author}
              </p>

              <p className="blog-description">
                {expandedBlog === blog._id
                  ? blog.description
                  : blog.description.length > DESCRIPTION_LIMIT
                  ? blog.description.slice(0, DESCRIPTION_LIMIT) + '...'
                  : blog.description}
              </p>

              {blog.description.length > DESCRIPTION_LIMIT && (
                <button
                  className="toggle-btn"
                  onClick={() =>
                    setExpandedBlog(expandedBlog === blog._id ? null : blog._id)
                  }
                >
                  {expandedBlog === blog._id ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
