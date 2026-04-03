import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faUserPlus,
  faSearch,
  faFilter,
  faRefresh,
  faUser,
  faStore,
  faShieldAlt,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import './UserManagement.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [roleOpen, setRoleOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Validation patterns
  const namePattern = /^[A-Za-z\s]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const resetForm = () => {
    setCurrentUser({
      name: '',
      email: '',
      password: '',
      role: 'buyer',
    });
    setIsEditing(false);
    setShowPassword(false);
    setValidationErrors({
      name: '',
      email: '',
      password: '',
    });
  };

  // ✅ Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        filterRole === 'all' ||
        user.role.toLowerCase() === filterRole.toLowerCase();

      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
  };

  // ✅ Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'email' && value.length > 0) {
      processedValue = value.toLowerCase();
    }

    setCurrentUser({ ...currentUser, [name]: processedValue });
    validateField(name, processedValue);
  };

  // ✅ Validate individual field
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (value.trim() === '') error = 'Name is required';
        else if (!namePattern.test(value.trim()))
          error = 'Name can only contain letters and spaces';
        else if (value.trim().length < 2)
          error = 'Name must be at least 2 characters';
        break;

      case 'email':
        if (value.trim() === '') error = 'Email is required';
        else if (!emailPattern.test(value.trim()))
          error = 'Please enter a valid email address';
        break;

      case 'password':
        if (!isEditing && value.trim() === '') error = 'Password is required';
        else if (value.trim() !== '' && !strongPasswordPattern.test(value))
          error =
            'Password must be at least 8 characters with uppercase, lowercase, number and special character';
        break;

      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error === '';
  };

  // ✅ Validate all fields
  const validateForm = () => {
    const nameValid = validateField('name', currentUser.name);
    const emailValid = validateField('email', currentUser.email);
    const passwordValid = isEditing
      ? true
      : validateField('password', currentUser.password);

    return nameValid && emailValid && passwordValid;
  };

  // ✅ Handle Add/Edit User
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:5000/api/${currentUser._id}`
        : 'http://localhost:5000/api/register';
      const method = isEditing ? 'PUT' : 'POST';

      const userData = {
        ...currentUser,
        email: currentUser.email.toLowerCase(),
      };
      if (isEditing && !userData.password) delete userData.password;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (isEditing) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user');
      }

      const result = await response.json();
      const updatedUser = isEditing ? result : result.user;

      if (isEditing) {
        setUsers(
          users.map((user) =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
        setSuccess('User updated successfully!');
      } else {
        setUsers([...users, updatedUser]);
        setSuccess('User added successfully!');
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Handle Delete User
  const handleDelete = async (id, name, role) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    if (role === 'admin') {
      setError('Admin profiles cannot be deleted.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user._id !== id));
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Handle Edit User
  const handleEdit = (user) => {
    if (user.role === 'admin') {
      setError('Admin profiles cannot be edited.');
      return;
    }

    setCurrentUser({
      ...user,
      password: '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper functions for UI
  const getRoleIcon = (role) => {
    switch (role) {
      case 'buyer':
        return faUser;
      case 'seller':
        return faStore;
      case 'admin':
        return faShieldAlt;
      default:
        return faUser;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'buyer':
        return '#3b82f6';
      case 'seller':
        return '#10b981';
      case 'admin':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getRoleName = (role) => role.charAt(0).toUpperCase() + role.slice(1);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '#e2e8f0' };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;

    const strengthMap = [
      { text: 'Very Weak', color: '#ef4444' },
      { text: 'Weak', color: '#f97316' },
      { text: 'Fair', color: '#eab308' },
      { text: 'Good', color: '#84cc16' },
      { text: 'Strong', color: '#10b981' },
      { text: 'Very Strong', color: '#059669' },
    ];

    return strengthMap[strength];
  };

  return (
    <div className="user-management-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="page-title">
            User <span className="highlight">Management</span>
          </h1>
          <p className="page-subtitle">
            Manage all users, sellers, and administrators
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f620' }}>
              <FontAwesomeIcon icon={faUser} style={{ color: '#3b82f6' }} />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {users.filter((u) => u.role === 'buyer').length}
              </span>
              <span className="stat-label">Buyers</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b98120' }}>
              <FontAwesomeIcon icon={faStore} style={{ color: '#10b981' }} />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {users.filter((u) => u.role === 'seller').length}
              </span>
              <span className="stat-label">Sellers</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf620' }}>
              <FontAwesomeIcon
                icon={faShieldAlt}
                style={{ color: '#8b5cf6' }}
              />
            </div>
            <div className="stat-info">
              <span className="stat-count">
                {users.filter((u) => u.role === 'admin').length}
              </span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ marginRight: '0.5rem' }}
          />
          <span className="message-text">{error}</span>
          <button className="message-close" onClick={() => setError('')}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ marginRight: '0.5rem' }}
          />
          <span className="message-text">{success}</span>
          <button className="message-close" onClick={() => setSuccess('')}>
            ×
          </button>
        </div>
      )}

      {/* Add/Edit User Card */}
      <div className="form-card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={faUserPlus} />
            {isEditing ? ' Edit User' : ' Add New User'}
          </h3>
          <button className="refresh-btn" onClick={fetchUsers}>
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <div className="input-with-validation">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentUser.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name (letters and spaces only)"
                  required
                  className={`form-input ${
                    validationErrors.name
                      ? 'error'
                      : currentUser.name
                      ? 'valid'
                      : ''
                  }`}
                  onBlur={() => validateField('name', currentUser.name)}
                />
                {currentUser.name && (
                  <div className="validation-icon">
                    {validationErrors.name ? (
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="error-icon"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="valid-icon"
                      />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <div className="validation-error">{validationErrors.name}</div>
              )}
              {currentUser.name && !validationErrors.name && (
                <div className="validation-success">Name is valid</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-with-validation">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={currentUser.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address (auto lowercase)"
                  required
                  className={`form-input ${
                    validationErrors.email
                      ? 'error'
                      : currentUser.email
                      ? 'valid'
                      : ''
                  }`}
                  onBlur={() => validateField('email', currentUser.email)}
                />
                {currentUser.email && (
                  <div className="validation-icon">
                    {validationErrors.email ? (
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="error-icon"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="valid-icon"
                      />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <div className="validation-error">{validationErrors.email}</div>
              )}
              {currentUser.email && !validationErrors.email && (
                <div className="validation-success">Email format is valid</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">
                {isEditing
                  ? 'Password (leave blank to keep unchanged)'
                  : 'Password'}
                {!isEditing && <span className="required">*</span>}
              </label>
              <div className="password-input-container">
                <div className="input-with-validation">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={currentUser.password}
                    onChange={handleInputChange}
                    placeholder={
                      isEditing ? 'Enter new password' : 'Enter password'
                    }
                    required={!isEditing}
                    className={`form-input ${
                      validationErrors.password
                        ? 'error'
                        : currentUser.password && !isEditing
                        ? 'valid'
                        : ''
                    }`}
                    onBlur={() =>
                      validateField('password', currentUser.password)
                    }
                  />
                  {currentUser.password && (
                    <div className="validation-icon">
                      {validationErrors.password ? (
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="error-icon"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="valid-icon"
                        />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Password validation messages */}
              {currentUser.password && !isEditing && (
                <div className="password-strength-container">
                  <div className="password-strength-text">
                    Password strength:{' '}
                    <span
                      style={{
                        color: getPasswordStrength(currentUser.password).color,
                        fontWeight: '600',
                      }}
                    >
                      {getPasswordStrength(currentUser.password).text}
                    </span>
                  </div>
                  <div className="password-requirements">
                    <p className="requirements-title">Password must contain:</p>
                    <ul className="requirements-list">
                      <li
                        className={
                          currentUser.password.length >= 8
                            ? 'requirement-met'
                            : ''
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[a-z]/.test(currentUser.password)
                            ? 'requirement-met'
                            : ''
                        }
                      >
                        One lowercase letter
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(currentUser.password)
                            ? 'requirement-met'
                            : ''
                        }
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={
                          /\d/.test(currentUser.password)
                            ? 'requirement-met'
                            : ''
                        }
                      >
                        One number
                      </li>
                      <li
                        className={
                          /[@$!%*?&]/.test(currentUser.password)
                            ? 'requirement-met'
                            : ''
                        }
                      >
                        One special character (@$!%*?&)
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <div className="validation-error">
                  {validationErrors.password}
                </div>
              )}

              {currentUser.password &&
                !validationErrors.password &&
                !isEditing && (
                  <div className="validation-success">
                    Password is strong and secure
                  </div>
                )}
            </div>

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <div className="role-select-container">
                <div
                  className={`custom-select ${roleOpen ? 'open' : ''}`}
                  onClick={() => setRoleOpen(!roleOpen)}
                >
                  <div className="selected-value">
                    <FontAwesomeIcon icon={getRoleIcon(currentUser.role)} />
                    {getRoleName(currentUser.role)}
                  </div>

                  {roleOpen && (
                    <ul className="select-dropdown">
                      {['buyer', 'seller'].map((role) => (
                        <li
                          key={role}
                          onClick={() => {
                            setCurrentUser({ ...currentUser, role });
                            setRoleOpen(false);
                          }}
                        >
                          <FontAwesomeIcon icon={getRoleIcon(role)} />
                          {getRoleName(role)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="role-icon">
                  <FontAwesomeIcon icon={getRoleIcon(currentUser.role)} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={Object.values(validationErrors).some((err) => err)}
            >
              {isEditing ? 'Update User' : 'Add User'}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-container">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <div
              className={`custom-select filter ${filterOpen ? 'open' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <div className="selected-value">
                <FontAwesomeIcon icon={faFilter} />
                {filterRole === 'all' ? 'All Roles' : getRoleName(filterRole)}
              </div>

              {filterOpen && (
                <ul className="select-dropdown">
                  {['all', 'buyer', 'seller', 'admin'].map((role) => (
                    <li
                      key={role}
                      onClick={() => {
                        setFilterRole(role);
                        setFilterOpen(false);
                      }}
                    >
                      {role === 'all' ? 'All Roles' : getRoleName(role)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="results-info">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or add a new user</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th className="user-name">Name</th>
                  <th className="user-email">Email</th>
                  <th className="user-role">Role</th>
                  <th className="user-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`user-row ${
                      user.role === 'admin' ? 'admin-row' : ''
                    }`}
                  >
                    <td className="user-name-cell">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name-text">{user.name}</span>
                        <span className="user-id">
                          ID: {user._id?.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="user-email-cell">
                      <span className="email-text">{user.email}</span>
                    </td>
                    <td className="user-role-cell">
                      <span
                        className="role-badge"
                        style={{
                          backgroundColor: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role),
                          borderColor: getRoleColor(user.role),
                        }}
                      >
                        <FontAwesomeIcon icon={getRoleIcon(user.role)} />
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="user-actions-cell">
                      <div className="action-buttons">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="action-btn edit-btn"
                            title="Edit user"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit</span>
                          </button>
                        )}

                        {user.role !== 'admin' && (
                          <button
                            onClick={() =>
                              handleDelete(user._id, user.name, user.role)
                            }
                            className="action-btn delete-btn"
                            title="Delete user"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
