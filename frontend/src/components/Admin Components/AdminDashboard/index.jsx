import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faChartLine,
  faDollarSign,
  faShoppingCart,
  faBox,
  faUsers,
  faTags,
  faExclamationTriangle,
  faRefresh,
  faEye,
  faArrowUp,
  faArrowDown,
  faTrophy,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    salesOverTime: [],
    productWiseSales: [],
    categoryWiseSales: [],
    sellerPerformance: [],
    metrics: null,
    loading: true,
  });

  const [range, setRange] = useState(7);
  const [statsLoading, setStatsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, [range]);

  const fetchAdminData = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');

      // Fetch metrics
      const metricsRes = await fetch(
        `http://localhost:5000/api/admin/dashboard/metrics?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const metricsData = await metricsRes.json();

      // Fetch sales over time
      const salesRes = await fetch(
        `http://localhost:5000/api/admin/dashboard/sales-over-time?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const salesData = await salesRes.json();

      // Fetch product-wise sales
      const productsRes = await fetch(
        'http://localhost:5000/api/admin/dashboard/product-wise-sales',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const productsData = await productsRes.json();

      // Fetch category-wise sales
      const categoriesRes = await fetch(
        'http://localhost:5000/api/admin/dashboard/category-wise-sales',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const categoriesData = await categoriesRes.json();

      // Fetch seller performance
      const sellersRes = await fetch(
        'http://localhost:5000/api/admin/dashboard/seller-perfomance',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sellersData = await sellersRes.json();

      setDashboardData({
        salesOverTime: Array.isArray(salesData) ? salesData : [],
        productWiseSales: Array.isArray(productsData) ? productsData : [],
        categoryWiseSales: Array.isArray(categoriesData) ? categoriesData : [],
        sellerPerformance: Array.isArray(sellersData) ? sellersData : [],
        metrics: metricsData,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAdminData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxSalesValue = Math.max(
    ...dashboardData.salesOverTime.map((d) => d.revenue || 0)
  );
  const maxProductsSold = Math.max(
    ...dashboardData.salesOverTime.map((d) => d.productsSold || 0)
  );

  // Generate system alerts
  const generateAlerts = () => {
    const alerts = [];

    // Low performing sellers
    const lowPerformers = dashboardData.sellerPerformance.filter(
      (seller) => seller.revenue < 10000 && seller.productsSold < 10
    );
    if (lowPerformers.length > 0) {
      alerts.push({
        type: 'seller',
        message: `${lowPerformers.length} sellers are underperforming`,
        priority: 'medium',
        icon: faUsers,
      });
    }

    // Categories with no sales
    const noSaleCategories = dashboardData.categoryWiseSales.filter(
      (cat) => cat.revenue === 0
    );
    if (noSaleCategories.length > 0) {
      alerts.push({
        type: 'category',
        message: `${noSaleCategories.length} categories have no sales`,
        priority: 'low',
        icon: faTags,
      });
    }

    // Products out of stock (assuming we have stock data)
    const lowStockProducts = dashboardData.productWiseSales
      .filter((product) => product.totalSold > 100 && product.revenue < 5000)
      .slice(0, 3);
    lowStockProducts.forEach((product) => {
      alerts.push({
        type: 'product',
        message: `${product.productName} has high sales but low revenue`,
        productId: product.productId,
        priority: 'high',
        icon: faBox,
      });
    });

    return alerts.slice(0, 5);
  };

  if (dashboardData.loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = dashboardData.metrics || {
    totalRevenue: { value: 0, change: 0, trend: 'up' },
    totalOrders: { value: 0, change: 0, trend: 'up' },
    totalProductsSold: { value: 0, change: 0, trend: 'up' },
    activeSellers: { value: 0, total: 0, change: 0, trend: 'up' },
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue.value),
      icon: faDollarSign,
      color: '#10b981',
      description: 'Total revenue generated',
      change:
        metrics.totalRevenue.change === 0
          ? '0%' // No sign for zero
          : `${metrics.totalRevenue.change > 0 ? '+' : ''}${
              metrics.totalRevenue.change
            }%`,
      trend: metrics.totalRevenue.trend,
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.value,
      icon: faShoppingCart,
      color: '#3b82f6',
      description: 'Orders processed',
      change:
        metrics.totalOrders.change === 0
          ? '0%'
          : `${metrics.totalOrders.change > 0 ? '+' : ''}${
              metrics.totalOrders.change
            }%`,
      trend: metrics.totalOrders.trend,
    },
    {
      title: 'Products Sold',
      value: metrics.totalProductsSold.value.toLocaleString(),
      icon: faBox,
      color: '#8b5cf6',
      description: 'Total units sold',
      change:
        metrics.totalProductsSold.change === 0
          ? '0%'
          : `${metrics.totalProductsSold.change > 0 ? '+' : ''}${
              metrics.totalProductsSold.change
            }%`,
      trend: metrics.totalProductsSold.trend,
    },
    {
      title: 'Active Sellers',
      value: `${metrics.activeSellers.value}/${metrics.activeSellers.total}`,
      icon: faUsers,
      color: '#f59e0b',
      description: 'Active sellers',
      change:
        metrics.activeSellers.change === 0
          ? '0%'
          : `${metrics.activeSellers.change > 0 ? '+' : ''}${
              metrics.activeSellers.change
            }%`,
      trend: metrics.activeSellers.trend,
    },
  ];

  const alerts = generateAlerts();

  return (
    <div className="admin-dashboard-container">
      {/* Header Section */}
      <div className="admin-header-section">
        <div className="admin-header-content">
          <h1 className="admin-page-title">
            Admin <span className="admin-highlight">Dashboard</span>
          </h1>
          <p className="admin-page-subtitle">
            Monitor platform performance, sales analytics, and user activity
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-refresh-btn"
            onClick={handleRefresh}
            disabled={statsLoading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={statsLoading} />
            {statsLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="admin-metrics-grid">
        {metricCards.map((card, index) => (
          <div className="admin-metric-card" key={index}>
            <div className="admin-metric-card-header">
              <div
                className="admin-metric-icon"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <FontAwesomeIcon
                  icon={card.icon}
                  style={{ color: card.color }}
                />
              </div>
              <div className="admin-metric-change">
                <span className={`change-indicator ${card.trend}`}>
                  <FontAwesomeIcon
                    icon={card.trend === 'up' ? faArrowUp : faArrowDown}
                  />
                  {card.change}
                </span>
              </div>
            </div>
            <div className="admin-metric-content">
              <h3 className="admin-metric-value">{card.value}</h3>
              <p className="admin-metric-title">{card.title}</p>
              <p className="admin-metric-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="admin-content-grid">
        {/* Left Column - Charts & Product Sales */}
        <div className="admin-left-column">
          {/* Sales Over Time Chart */}
          <div className="admin-chart-card">
            <div className="admin-card-header">
              <h3>
                <FontAwesomeIcon icon={faChartLine} />
                Sales Over Time
              </h3>
              <div className="admin-chart-header-actions">
                <div className="admin-time-range-selector">
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      className={`admin-range-btn ${
                        range === d ? 'active' : ''
                      }`}
                      onClick={() => setRange(d)}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-chart-container">
              {dashboardData.salesOverTime.length > 0 ? (
                <div className="admin-sales-chart">
                  <div className="admin-chart-visualization">
                    {/* Revenue Bars */}
                    <div className="admin-chart-bars">
                      {dashboardData.salesOverTime.map((item, index) => {
                        const height =
                          maxSalesValue > 0
                            ? (item.revenue / maxSalesValue) * 100
                            : 0;
                        return (
                          <div
                            key={index}
                            className="admin-chart-bar-container"
                          >
                            <div
                              className="admin-chart-bar revenue-bar"
                              style={{ height: `${height}%` }}
                              title={`Date: ${
                                item.date
                              }\nRevenue: ${formatCurrency(
                                item.revenue
                              )}\nProducts Sold: ${item.productsSold}`}
                            >
                              <div className="admin-bar-tooltip">
                                <div className="admin-tooltip-date">
                                  {item.date}
                                </div>
                                <div className="admin-tooltip-value">
                                  Revenue: {formatCurrency(item.revenue)}
                                </div>
                                <div className="admin-tooltip-value">
                                  Sold: {item.productsSold}
                                </div>
                              </div>
                            </div>
                            <span className="admin-bar-label">
                              {item.date?.split('-')[2]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="admin-chart-labels">
                    <span className="admin-label-min">₹0</span>
                    <span className="admin-label-max">
                      {formatCurrency(maxSalesValue)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="admin-no-chart-data">
                  <div className="admin-no-chart-icon">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <h4>No Sales Data Available</h4>
                  <p>Start monitoring platform sales to see analytics here</p>
                </div>
              )}
            </div>
          </div>

          {/* Product-wise Sales */}
          <div className="admin-data-card">
            <div className="admin-card-header">
              <h3>
                <FontAwesomeIcon icon={faChartBar} />
                Top Products by Revenue
              </h3>
            </div>
            <div className="admin-data-table-wrapper">
              {dashboardData.productWiseSales.length > 0 ? (
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Revenue</th>
                      <th>Units Sold</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.productWiseSales
                      .slice(0, 5)
                      .map((product, index) => {
                        const maxRevenue = Math.max(
                          ...dashboardData.productWiseSales.map(
                            (p) => p.revenue || 0
                          )
                        );
                        const progress =
                          maxRevenue > 0
                            ? (product.revenue / maxRevenue) * 100
                            : 0;

                        return (
                          <tr key={product.productId || index}>
                            <td className="admin-product-name-cell">
                              <div className="admin-product-info">
                                <span
                                  className={`admin-rank-badge rank-${
                                    index + 1
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <span className="admin-product-name">
                                  {product.productName || 'Unknown Product'}
                                </span>
                              </div>
                            </td>
                            <td className="admin-revenue-cell">
                              {formatCurrency(product.revenue || 0)}
                            </td>
                            <td className="admin-sold-cell">
                              {product.totalSold || 0}
                            </td>
                            <td>
                              <div className="admin-progress-bar">
                                <div
                                  className="admin-progress-fill"
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
                <div className="admin-no-data">
                  <p>No product sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Categories, Sellers & Alerts */}
        <div className="admin-right-column">
          {/* Category-wise Sales */}
          <div className="admin-data-card">
            <div className="admin-card-header">
              <h3>
                <FontAwesomeIcon icon={faTags} />
                Category Performance
              </h3>
            </div>
            <div className="admin-category-list">
              {dashboardData.categoryWiseSales.length > 0 ? (
                dashboardData.categoryWiseSales
                  .slice(0, 4)
                  .map((category, index) => (
                    <div className="admin-category-item" key={index}>
                      <div className="admin-category-header">
                        <span className="admin-category-name">
                          {category.categoryName || 'Uncategorized'}
                        </span>
                        <span className="admin-category-revenue">
                          {formatCurrency(category.revenue || 0)}
                        </span>
                      </div>
                      <div className="admin-category-progress">
                        <div
                          className="admin-category-progress-bar"
                          style={{
                            width: `${Math.min(
                              100,
                              (category.revenue / metrics.totalRevenue.value) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="admin-no-data">
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Seller Performance */}
          <div className="admin-data-card">
            <div className="admin-card-header">
              <h3>
                <FontAwesomeIcon icon={faTrophy} />
                Top Sellers
              </h3>
            </div>
            <div className="admin-seller-list">
              {dashboardData.sellerPerformance.length > 0 ? (
                dashboardData.sellerPerformance
                  .slice(0, 4)
                  .map((seller, index) => (
                    <div
                      className="admin-seller-item"
                      key={seller.sellerId || index}
                    >
                      <div className="admin-seller-info">
                        <span className={`admin-seller-rank rank-${index + 1}`}>
                          {index + 1}
                        </span>
                        <div className="admin-seller-details">
                          <span className="admin-seller-name">
                            {seller.sellerName || 'Unknown Seller'}
                          </span>
                          <span className="admin-store-name">
                            {seller.storeName || 'No Store'}
                          </span>
                        </div>
                      </div>
                      <div className="admin-seller-stats">
                        <div className="admin-seller-stat">
                          <span className="admin-stat-label">Revenue:</span>
                          <span className="admin-stat-value">
                            {formatCurrency(seller.revenue || 0)}
                          </span>
                        </div>
                        <div className="admin-seller-stat">
                          <span className="admin-stat-label">Sold:</span>
                          <span className="admin-stat-value">
                            {seller.productsSold || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="admin-no-data">
                  <p>No seller data available</p>
                </div>
              )}
            </div>
          </div>

          {/* System Alerts */}
          <div className="admin-alerts-card">
            <div className="admin-card-header">
              <h3>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                System Alerts
                {alerts.length > 0 && (
                  <span className="admin-alert-count">{alerts.length}</span>
                )}
              </h3>
            </div>
            <div className="admin-alerts-list">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div
                    className={`admin-alert-item ${alert.priority}`}
                    key={index}
                  >
                    <div className="admin-alert-icon">
                      <FontAwesomeIcon icon={alert.icon} />
                    </div>
                    <div className="admin-alert-content">
                      <p className="admin-alert-message">{alert.message}</p>
                      <span className="admin-alert-type">{alert.type}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-no-alerts">
                  <p>No system alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
