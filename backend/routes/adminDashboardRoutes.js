const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../authmiddelware/authMiddleware");

const {
  getAdminDashboardMetrics,
  getAdminSalesOverTime,
  getAdminProductWiseSales,
  getAdminCategoryWiseSales,
  getAdminSellerPerfomance,
} = require("../controllers/adminDashboardController");

router.get(
  "/dashboard/metrics",
  protect,
  authorize("admin"),
  getAdminDashboardMetrics,
);

router.get(
  "/dashboard/sales-over-time",
  protect,
  authorize("admin"),
  getAdminSalesOverTime,
);

router.get(
  "/dashboard/product-wise-sales",
  protect,
  authorize("admin"),
  getAdminProductWiseSales,
);

router.get(
  "/dashboard/category-wise-sales",
  protect,
  authorize("admin"),
  getAdminCategoryWiseSales,
);

router.get(
  "/dashboard/seller-perfomance",
  protect,
  authorize("admin"),
  getAdminSellerPerfomance,
);

module.exports = router;
