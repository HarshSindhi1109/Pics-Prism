const Order = require("../models/Order");

const getSellerDashboardSummary = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const summary = await Order.aggregate([
      { $unwind: "$products" },

      {
        $match: {
          "products.sellerId": sellerId,
        },
      },

      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity"],
            },
          },

          totalProductsSold: {
            $sum: "$products.quantity",
          },

          totalOrders: { $addToSet: "$_id" },

          pendingOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["Pending", "Processing"]] }, 1, 0],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalProductsSold: 1,
          totalOrders: { $size: "$totalOrders" },
          pendingOrders: 1,
        },
      },
    ]);

    res.json(
      summary[0] || {
        totalIncome: 0,
        totalProductsSold: 0,
        totalOrders: 0,
        pendingOrders: 0,
      },
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const percentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getSalesChart = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const range = Number(req.query.range) || 7;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - range + 1);

    const prevStart = new Date(startDate);
    prevStart.setDate(prevStart.getDate() - range);

    const prevEndDate = new Date(startDate);

    const salesPipeline = (start, end) => [
      { $unwind: "$products" },
      {
        $match: {
          "products.sellerId": sellerId,
          status: "Delivered",
          createdAt: { $gte: start, $lt: end },
        },
      },
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
          income: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity"],
            },
          },
        },
      },
      { $sort: { "_id.day": 1 } },
    ];

    const currentSales = await Order.aggregate(
      salesPipeline(startDate, endDate),
    );

    const prevSales = await Order.aggregate(
      salesPipeline(prevStart, prevEndDate),
    );

    // Current Matrics
    const currentTotal = currentSales.reduce((sum, d) => sum + d.income, 0);

    const currentDailyAvg = currentSales.length
      ? currentTotal / currentSales.length
      : 0;

    const currentActiveDays = currentSales.length;

    const currentPeakDay = Math.max(...currentSales.map((d) => d.income), 0);

    // Previous Metrics
    const prevTotal = prevSales[0]?.total || 0;

    const prevDailyAvg = prevSales.length ? prevTotal / prevSales.length : 0;

    const prevActiveDays = prevSales.length;

    const prevPeakDay = Math.max(...prevSales.map((d) => d.income), 0);

    res.json({
      range,
      totals: {
        value: currentTotal,
        change: Number(percentChange(currentTotal, prevTotal).toFixed(1)),
      },

      dailyAverage: {
        value: Number(currentDailyAvg.toFixed(2)),
        change: Number(percentChange(currentDailyAvg, prevDailyAvg).toFixed(1)),
      },

      activeDays: {
        value: currentActiveDays,
        change: Number(
          percentChange(currentActiveDays, prevActiveDays).toFixed(1),
        ),
      },

      peakDay: {
        value: currentPeakDay,
        change: Number(percentChange(currentPeakDay, prevPeakDay).toFixed(1)),
      },

      chartData: currentSales.map((d) => ({
        date: d._id.day,
        income: d.income,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },

      {
        $match: {
          "products.sellerId": sellerId,
        },
      },

      {
        $group: {
          _id: "$products.productId",
          sold: { $sum: "$products.quantity" },
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
          name: "$product.name",
          sold: 1,
          stock: "$product.stock",
        },
      },

      { $sort: { sold: -1 } },
    ]);

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSellerDashboardSummary,
  getSalesChart,
  getTopProducts,
};
