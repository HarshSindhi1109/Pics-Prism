import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faChartLine,
  faDollarSign,
  faShoppingCart,
  faBox,
  faClock,
  faExclamationTriangle,
  faRefresh,
  faEye,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faArrowUp,
  faArrowDown,
  faReceipt,
  faTags,
} from '@fortawesome/free-solid-svg-icons';
import './SellerDashboard.css';

export default function SellerDashboard() {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalIncome: 0,
      totalProductsSold: 0,
      totalOrders: 0,
      pendingOrders: 0,
    },
    chartData: [],
    topProducts: [],
    loading: true,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const [range, setRange] = useState(7);
  // const [salesOverview, setSalesOverview] = useState({
  //   totalSales: 0,
  //   percentageChange: 0,
  // });

  const [salesStats, setSalesStats] = useState({
    totals: { value: 0, change: 0 },
    dailyAverage: { value: 0, change: 0 },
    activeDays: { value: 0, change: 0 },
    peakDay: { value: 0, change: 0 },
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  // Fetch dashboard data from available endpoints
  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');

      // 1. Fetch dashboard summary (available endpoint)
      const summaryRes = await fetch(
        'http://localhost:5000/api/seller/dashboard',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const summaryData = await summaryRes.json();

      // 2. Fetch sales chart data (available endpoint)
      const chartRes = await fetch(
        `http://localhost:5000/api/seller/dashboard/sales-chart?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chartResult = await chartRes.json();

      setSalesStats({
        totals: chartResult.totals,
        dailyAverage: chartResult.dailyAverage,
        activeDays: chartResult.activeDays,
        peakDay: chartResult.peakDay,
      });

      setDashboardData((prev) => ({
        ...prev,
        chartData: chartResult.chartData,
      }));

      // 3. Fetch top products (available endpoint)
      const topProductsRes = await fetch(
        'http://localhost:5000/api/seller/dashboard/top-products',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const topProductsData = await topProductsRes.json();

      // 4. Fetch recent orders from orders endpoint (available - seller sees only their orders)
      const ordersRes = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const ordersData = await ordersRes.json();

      // Process top products to ensure they have required fields
      const processedTopProducts = Array.isArray(topProductsData)
        ? topProductsData.map((product) => ({
            ...product,
            sold: product.sold || 0,
            stock: product.stock || 0,
            name: product.name || 'Unknown Product',
          }))
        : [];

      setDashboardData({
        metrics: summaryData || {
          totalIncome: 0,
          totalProductsSold: 0,
          totalOrders: 0,
          pendingOrders: 0,
        },
        chartData: chartResult.chartData || [],
        topProducts: processedTopProducts,
        loading: false,
      });

      // Set recent orders (first 5 orders)
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    } finally {
      setStatsLoading(false);
    }
  };

  // Generate notifications based on available data
  const generateNotifications = () => {
    const notifications = [];

    // Pending orders notification
    if (dashboardData.metrics.pendingOrders > 0) {
      notifications.push({
        type: 'order',
        message: `${dashboardData.metrics.pendingOrders} pending orders need attention`,
        time: 'Just now',
        priority: 'high',
      });
    }

    // Low stock notifications from top products
    dashboardData.topProducts.forEach((product) => {
      if (product.stock < 10) {
        notifications.push({
          type: 'stock',
          message: `${product.name} is low in stock (${product.stock} left)`,
          productId: product.productId || product._id,
          priority: 'medium',
        });
      }
    });

    // Recent order notifications
    if (recentOrders.length > 0) {
      const recentOrder = recentOrders[0];
      notifications.push({
        type: 'new_order',
        message: `New order #${recentOrder._id?.slice(-6) || 'N/A'} received`,
        orderId: recentOrder._id,
        time: 'Recently',
        priority: 'medium',
      });
    }

    return notifications.slice(0, 5);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#10b981';
      case 'Shipped':
        return '#3b82f6';
      case 'Processing':
        return '#f59e0b';
      case 'Pending':
        return '#f59e0b';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return faCheckCircle;
      case 'Shipped':
        return faTruck;
      case 'Processing':
        return faClock;
      case 'Pending':
        return faClock;
      case 'Cancelled':
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  const metricCards = [
    {
      title: 'Total Income',
      value: formatCurrency(dashboardData.metrics.totalIncome || 0),
      icon: faDollarSign,
      color: '#10b981',
      description: 'Total revenue generated',
    },
    {
      title: 'Total Orders',
      value: dashboardData.metrics.totalOrders || 0,
      icon: faShoppingCart,
      color: '#3b82f6',
      description: 'Orders received',
    },
    {
      title: 'Products Sold',
      value: dashboardData.metrics.totalProductsSold || 0,
      icon: faBox,
      color: '#8b5cf6',
      description: 'Units sold',
    },
    {
      title: 'Pending Orders',
      value: dashboardData.metrics.pendingOrders || 0,
      icon: faClock,
      color: '#f59e0b',
      description: 'Awaiting processing',
    },
  ];

  const notifications = generateNotifications();

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'order':
        navigate('/seller-home/manage-order-status');
        break;

      case 'stock':
        navigate('/seller-home/add-product', {
          state: { productId: notification.productId },
        });
        break;

      case 'new_order':
        navigate('/seller-home/manage-order-status');
        break;

      default:
        alert('Unknown notification type');
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="seller-dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-container">
      {/* Header Section */}
      <div className="seller-header-section">
        <div className="header-content">
          <h1 className="page-title">
            Seller <span className="highlight">Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Monitor your sales, orders, and business performance
          </p>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={statsLoading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={statsLoading} />
            {statsLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metricCards.map((card, index) => (
          <div className="metric-card" key={index}>
            <div className="metric-card-header">
              <div
                className="metric-icon"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <FontAwesomeIcon
                  icon={card.icon}
                  style={{ color: card.color }}
                />
              </div>
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{card.value}</h3>
              <p className="metric-title">{card.title}</p>
              <p className="metric-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Main Content */}
      <div className="content-grid">
        {/* Left Column - Charts */}
        <div className="left-column">
          {/* Sales Chart */}
          <div className="chart-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faChartLine} />
                Sales Overview
              </h3>
              <div className="chart-header-actions">
                <div className="time-range-selector">
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      className={`range-btn ${range === d ? 'active' : ''}`}
                      onClick={() => setRange(d)}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: '#3b82f6' }}
                    ></div>
                    <span>Sales</span>
                  </div>
                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: '#8b5cf6' }}
                    ></div>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              {dashboardData.chartData.length > 0 ? (
                <div className="sales-chart">
                  <div className="chart-header">
                    <div className="chart-summary">
                      <h4 className="chart-title">Total Sales This Month</h4>
                      <div className="chart-value">
                        ₹
                        {dashboardData.chartData
                          .reduce((sum, item) => sum + (item.income || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="chart-change">
                        <span
                          className={
                            salesStats.totals.change >= 0
                              ? 'change-positive'
                              : 'change-negative'
                          }
                        >
                          <FontAwesomeIcon
                            icon={
                              salesStats.totals.change >= 0
                                ? faArrowUp
                                : faArrowDown
                            }
                          />
                          {Math.abs(salesStats.totals.change)}%
                          {salesStats.totals.change >= 0
                            ? ' increase '
                            : ' decrease '}
                          from previous period
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-visualization">
                    {/* Grid Lines */}
                    <div className="chart-grid">
                      {[0, 25, 50, 75, 100].map((percent, index) => (
                        <div key={index} className="grid-line"></div>
                      ))}
                    </div>

                    <div className="chart-bars">
                      {dashboardData.chartData.map((item, index) => {
                        const maxValue = Math.max(
                          ...dashboardData.chartData.map((d) => d.income || 0)
                        );
                        const height =
                          maxValue > 0 ? (item.income / maxValue) * 100 : 0;
                        const isToday =
                          index === dashboardData.chartData.length - 1;

                        return (
                          <div
                            key={index}
                            className={`chart-bar-container ${
                              isToday ? 'today-bar' : ''
                            }`}
                          >
                            <div
                              className="chart-bar"
                              style={{ height: `${height}%` }}
                            >
                              <div className="bar-tooltip">
                                <div className="tooltip-date">
                                  {item.date || `Day ${index + 1}`}
                                </div>
                                <div className="tooltip-value">
                                  Revenue: ₹{item.income?.toLocaleString() || 0}
                                </div>
                              </div>
                            </div>
                            <span className="bar-label">
                              {index %
                                Math.ceil(
                                  dashboardData.chartData.length / 10
                                ) ===
                              0
                                ? item.date?.split('-')[2]
                                : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="chart-labels">
                    <span className="label-min">₹0</span>
                    <span className="label-max">
                      ₹
                      {Math.max(
                        ...dashboardData.chartData.map((d) => d.income || 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="chart-stats">
                    <div className="stat-item">
                      <div className="stat-value">
                        ₹{salesStats.dailyAverage.value.toLocaleString()}
                      </div>
                      <div className="stat-label">Daily Average</div>
                      <div
                        className={`stat-trend ${
                          salesStats.dailyAverage.change >= 0
                            ? 'change-positive'
                            : 'change-negative'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            salesStats.dailyAverage.change >= 0
                              ? faArrowUp
                              : faArrowDown
                          }
                        />
                        {Math.abs(salesStats.dailyAverage.change)}%
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-value">
                        {salesStats.activeDays.value}
                      </div>
                      <div className="stat-label">Active Days</div>
                      <div
                        className={`stat-trend ${
                          salesStats.activeDays.change >= 0
                            ? 'change-positive'
                            : 'change-negative'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            salesStats.activeDays.change >= 0
                              ? faArrowUp
                              : faArrowDown
                          }
                        />
                        {Math.abs(salesStats.activeDays.change)}%
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-value">
                        ₹{salesStats.peakDay.value.toLocaleString()}
                      </div>
                      <div className="stat-label">Peak Day</div>
                      <div
                        className={`stat-trend ${
                          salesStats.peakDay.change >= 0
                            ? 'change-positive'
                            : 'change-negative'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            salesStats.peakDay.change >= 0
                              ? faArrowUp
                              : faArrowDown
                          }
                        />
                        {Math.abs(salesStats.peakDay.change)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-chart-data">
                  <div className="no-chart-icon">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <h4>No Sales Data Available</h4>
                  <p>Start selling products to see your sales analytics here</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="top-products-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faTags} />
                Top Selling Products
              </h3>
            </div>
            <div className="top-products-table-wrapper">
              {dashboardData.topProducts.length > 0 ? (
                <table className="top-products-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Sold</th>
                      <th>Stock</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topProducts.map((product, index) => {
                      const maxSold = Math.max(
                        ...dashboardData.topProducts.map((p) => p.sold || 0)
                      );
                      const progress =
                        maxSold > 0 ? (product.sold / maxSold) * 100 : 0;

                      return (
                        <tr key={product.productId || index}>
                          <td>
                            <span className={`rank-badge rank-${index + 1}`}>
                              {index + 1}
                            </span>
                          </td>

                          <td className="product-name-cell">{product.name}</td>

                          <td className="sold-cell">{product.sold}</td>

                          <td>
                            <span
                              className={`stock-pill ${
                                product.stock < 10 ? 'low' : 'ok'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>

                          <td>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">
                  <p>No products sold yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Orders & Notifications */}
        <div className="right-column">
          {/* Recent Orders */}
          <div className="orders-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faReceipt} />
                Recent Orders
              </h3>
              <a href="/seller-home/manage-order-status" className="view-all">
                View All →
              </a>
            </div>
            <div className="orders-list">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div className="order-item" key={order._id}>
                    <div className="order-header">
                      <span className="order-id">
                        #{order._id?.slice(-6) || 'N/A'}
                      </span>
                      <span
                        className="vendor-order-status"
                        style={{
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                        }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                        {order.status || 'Processing'}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="order-products">
                        {order.products?.slice(0, 2).map((product, idx) => (
                          <span key={idx} className="product-name">
                            {product.quantity}x {product.name || 'Product'}
                          </span>
                        ))}
                        {order.products && order.products.length > 2 && (
                          <span className="more-products">
                            +{order.products.length - 2} more
                          </span>
                        )}
                      </div>
                      <div className="order-footer">
                        <span className="order-amount">
                          ₹{order.amount || 0}
                        </span>
                        <span className="order-time">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="notifications-card">
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Notifications
                {notifications.length > 0 && (
                  <span className="alert-count">{notifications.length}</span>
                )}
              </h3>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div
                    className={`notification-item ${notification.priority}`}
                    key={index}
                  >
                    <div className="notification-icon">
                      {notification.type === 'order' && (
                        <FontAwesomeIcon icon={faShoppingCart} />
                      )}
                      {notification.type === 'stock' && (
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      )}
                      {notification.type === 'new_order' && (
                        <FontAwesomeIcon icon={faBox} />
                      )}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <span className="notification-time">
                        {notification.time || 'Just now'}
                      </span>
                    </div>
                    <button
                      className="notification-action"
                      onClick={() => handleNotificationClick(notification)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
