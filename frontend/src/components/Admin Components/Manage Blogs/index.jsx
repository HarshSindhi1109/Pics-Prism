import React, { useState, useEffect } from 'react';
import './Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overflowMap, setOverflowMap] = useState({});

  const [expandedBlog, setExpandedBlog] = useState(null);
  const DESCRIPTION_LIMIT = 160;

  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    description: '',
    image: null,
  });

  const [editingBlog, setEditingBlog] = useState(null);
  const [editData, setEditData] = useState({
    id: '',
    title: '',
    author: '',
    description: '',
    image: null,
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const map = {};

    blogs.forEach((blog) => {
      const el = document.getElementById(`desc-${blog._id}`);
      if (el) {
        map[blog._id] = el.scrollHeight > el.clientHeight;
      }
    });

    setOverflowMap(map);
  }, [blogs]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blogs');
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewBlogChange = (e) => {
    if (e.target.name === 'image') {
      setNewBlog({ ...newBlog, image: e.target.files[0] });
    } else {
      setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
    }
  };

  const handleEditChange = (e) => {
    if (e.target.name === 'image') {
      setEditData({ ...editData, image: e.target.files[0] });
    } else {
      setEditData({ ...editData, [e.target.name]: e.target.value });
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (
      !newBlog.title ||
      !newBlog.author ||
      !newBlog.description ||
      !newBlog.image
    )
      return;

    const formData = new FormData();
    formData.append('title', newBlog.title);
    formData.append('author', newBlog.author);
    formData.append('description', newBlog.description);
    formData.append('image', newBlog.image);

    try {
      const response = await fetch('http://localhost:5000/api/blogs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add blog');
      await fetchBlogs();
      setNewBlog({ title: '', author: '', description: '', image: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog._id);
    setEditData({
      id: blog._id,
      title: blog.title,
      author: blog.author,
      description: blog.description,
      image: null,
    });
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.author || !editData.description) return;

    const formData = new FormData();
    formData.append('title', editData.title);
    formData.append('author', editData.author);
    formData.append('description', editData.description);
    if (editData.image) formData.append('image', editData.image);

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${editData.id}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!response.ok) throw new Error('Failed to update blog');
      await fetchBlogs();
      setEditingBlog(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete blog');
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <section className="blogs" id="blogs">
      <h1 className="heading">
        Manage <span>Blogs</span>
      </h1>

      {/* Add Blog Form */}
      <form onSubmit={handleAddBlog} className="blog-form">
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={newBlog.title}
          onChange={handleNewBlogChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={newBlog.author}
          onChange={handleNewBlogChange}
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleNewBlogChange}
          required
        />
        <textarea
          name="description"
          placeholder="Blog Description"
          value={newBlog.description}
          onChange={handleNewBlogChange}
          required
        ></textarea>
        <button type="submit" className="btn">
          Add Blog
        </button>
      </form>

      {/* Edit Blog Form */}
      {editingBlog && (
        <form onSubmit={handleUpdateBlog} className="edit-blog-form">
          <input
            type="text"
            name="title"
            placeholder="Edit Title"
            value={editData.title}
            onChange={handleEditChange}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Edit Author"
            value={editData.author}
            onChange={handleEditChange}
            required
          />
          <input type="file" name="image" onChange={handleEditChange} />
          <textarea
            name="description"
            placeholder="Edit Description"
            value={editData.description}
            onChange={handleEditChange}
            required
          ></textarea>
          <div className="edit-blog-form-actions">
            <button type="submit" className="btn">
              Update Blog
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEditingBlog(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Blog List */}
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

              <div className="admin-blog-actions">
                <button onClick={() => handleEdit(blog)} className="edit-btn">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBlog(blog._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
