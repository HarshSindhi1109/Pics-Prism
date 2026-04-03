import React, { useState, useEffect, useRef } from 'react';
import './OrderStatusManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token'); // admin/seller token

        const response = await fetch('http://localhost:5000/api/orders', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update Order Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: updatedOrder.status } : order
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle dropdown with positioning
  const toggleDropdown = (id, event) => {
    event.stopPropagation();

    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);

      // Position the dropdown after state update
      setTimeout(() => {
        if (dropdownRefs.current[id]) {
          const dropdown = dropdownRefs.current[id];
          const trigger = dropdown.parentElement.querySelector('.selected');
          const rect = trigger.getBoundingClientRect();

          // Position dropdown below the trigger
          dropdown.style.top = `${rect.bottom + window.scrollY}px`;
          dropdown.style.left = `${rect.left + window.scrollX}px`;
        }
      }, 0);
    }
  };

  // Select status
  const handleSelect = (orderId, status) => {
    handleStatusChange(orderId, status);
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="order-status-container">
      <h1 className="heading">
        Order <span>Status</span>
      </h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <FontAwesomeIcon icon={faBoxOpen} className="no-orders-icon" />
          <h2>No Orders Yet</h2>
          <p>When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id?.slice(-6) || 'N/A'}</td>

                  <td>
                    <ul>
                      {order.products?.map((product) => (
                        <li key={product.productId}>
                          <img
                            src={`http://localhost:5000${product.imageUrl}`}
                            alt={product.name}
                          />
                          {product.name} (x{product.quantity})
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td>₹{order.amount}</td>

                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>

                  <td className="status-cell">
                    <span
                      className={`status ${order.status.trim().toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <div className="custom-select-wrapper">
                      <div className="custom-select">
                        <div
                          className={`selected ${
                            openDropdownId === order._id ? 'open' : ''
                          }`}
                          onClick={(e) => toggleDropdown(order._id, e)}
                        >
                          Change
                        </div>

                        {openDropdownId === order._id && (
                          <div
                            className="options"
                            ref={(el) => (dropdownRefs.current[order._id] = el)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              'Pending',
                              'Processing',
                              'Shipped',
                              'Delivered',
                              'Cancelled',
                            ].map((status) => (
                              <div
                                key={status}
                                onClick={() => handleSelect(order._id, status)}
                              >
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
