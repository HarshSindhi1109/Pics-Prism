const Order = require("../models/Order");
const Product = require("../models/ProductsModel");
const User = require("../models/User");
const Seller = require("../models/Seller");

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous) * 100).toFixed(1);
};

const getAdminDashboardMetrics = async (req, res) => {
  try {
    const range = Number(req.query.range) || 7;

    const currentEnd = new Date();
    const currentStart = new Date();
    currentStart.setDate(currentEnd.getDate() - range + 1);

    const previousEnd = new Date(currentStart);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - range + 1);

    const currentMetics = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: currentStart, $lte: currentEnd },
        },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          },
          totalProductsSold: { $sum: "$products.quantity" },
          totalOrders: { $addToSet: "$_id" },
        },
      },

      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalProductsSold: 1,
          totalOrders: { $size: "$totalOrders" },
        },
      },
    ]);

    const previousMetrics = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: previousStart, $lte: previousEnd },
        },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          },
          totalProductsSold: { $sum: "$products.quantity" },
          totalOrders: { $addToSet: "$_id" },
        },
      },

      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalProductsSold: 1,
          totalOrders: { $size: "$totalOrders" },
        },
      },
    ]);

    const currentActiveSellers = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: currentStart, $lte: currentEnd },
        },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: "$products.sellerId",
        },
      },
      {
        $count: "activeSellers",
      },
    ]);

    const previousActiveSellers = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: previousStart, $lte: previousEnd },
        },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: "$products.sellerId",
        },
      },
      {
        $count: "activeSellers",
      },
    ]);

    const totalSellers = await Seller.countDocuments({ status: "approved" });

    const current = currentMetics[0] || {
      totalRevenue: 0,
      totalProductsSold: 0,
      totalOrders: 0,
    };

    const previous = previousMetrics[0] || {
      totalRevenue: 0,
      totalProductsSold: 0,
      totalOrders: 0,
    };

    const currentActive = currentActiveSellers[0]?.activeSellers || 0;
    const previousActive = previousActiveSellers[0]?.activeSellers || 0;

    const revenueChange = calculatePercentageChange(
      current.totalRevenue,
      previous.totalRevenue,
    );

    const productsSoldChange = calculatePercentageChange(
      current.totalProductsSold,
      previous.totalProductsSold,
    );

    const ordersChange = calculatePercentageChange(
      current.totalOrders,
      previous.totalOrders,
    );

    const activeSellersChange = calculatePercentageChange(
      currentActive,
      previousActive,
    );

    res.json({
      totalRevenue: {
        value: current.totalRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? "up" : "down",
      },

      totalProductsSold: {
        value: current.totalProductsSold,
        change: productsSoldChange,
        trend: productsSoldChange >= 0 ? "up" : "down",
      },

      totalOrders: {
        value: current.totalOrders,
        change: ordersChange,
        trend: ordersChange >= 0 ? "up" : "down",
      },

      activeSellers: {
        value: currentActive,
        total: totalSellers,
        change: activeSellersChange,
        trend: activeSellersChange >= 0 ? "up" : "down",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sales Over Time
const getAdminSalesOverTime = async (req, res) => {
  try {
    const range = Number(req.query.range) || 7;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - range + 1);

    const sales = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: start, $lte: end },
        },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },

          revenue: {
            $sum: {
              $multiply: ["$products.quantity", "$products.price"],
            },
          },

          productsSold: { $sum: "$products.quantity" },
        },
      },

      { $sort: { "_id.day": 1 } },
    ]);

    res.json(
      sales.map((d) => ({
        date: d._id.day,
        revenue: d.revenue,
        productsSold: d.productsSold,
      })),
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Product-wise Sales
const getAdminProductWiseSales = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },

      { $unwind: "$products" },

      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$product.name",
          totalSold: 1,
          revenue: 1,
        },
      },

      { $sort: { revenue: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Category-wise Sales
const getAdminCategoryWiseSales = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: "Delivered" } },

      { $unwind: "$products" },

      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $group: {
          _id: "$product.category",
          revenue: {
            $sum: {
              $multiply: ["$products.quantity", "$products.price"],
            },
          },
          totalSold: { $sum: "$products.quantity" },
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },

      { $unwind: "$category" },

      {
        $project: {
          _id: 0,
          categoryName: "$category.name",
          revenue: 1,
          totalSold: 1,
        },
      },

      { $sort: { revenue: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Seller Perfomance Table
const getAdminSellerPerfomance = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: "Delivered" } },

      { $unwind: "$products" },

      {
        $group: {
          _id: "$products.sellerId",
          productsSold: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          },
        },
      },

      {
        $lookup: {
          from: "users", // Direct lookup to User collection
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "user",
          as: "seller",
        },
      },

      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          sellerId: "$_id",
          sellerName: "$user.name",
          storeName: { $ifNull: ["$seller.storeName", "No Store"] },
          productsSold: 1,
          revenue: 1,
        },
      },

      { $sort: { revenue: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAdminDashboardMetrics,
  getAdminSalesOverTime,
  getAdminProductWiseSales,
  getAdminCategoryWiseSales,
  getAdminSellerPerfomance,
};
