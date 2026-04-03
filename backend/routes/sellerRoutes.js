const express = require("express");
const router = express.Router();

const {
  applyForSeller,
  getMySellerProfile,
  updateSellerProfile,
  getAllSellers,
  updateSellerStatus,
  getPendingSellers,
  getPendingSellerCount,
  getSellerStatus,
} = require("../controllers/sellerController");
const {
  getSellerDashboardSummary,
  getSalesChart,
  getTopProducts,
} = require("../controllers/sellerDashboardController");

const { protect, authorize } = require("../authmiddelware/authMiddleware");
const upload = require("../middleware/upload");

// Buyer routes
router.post(
  "/apply",
  protect,
  authorize("buyer"),
  upload.single("licenseImage"),
  applyForSeller,
);
router.get("/status", protect, authorize("buyer"), getSellerStatus);

// Seller routes
router.get("/me", protect, authorize("seller"), getMySellerProfile);
router.put("/me", protect, authorize("seller"), updateSellerProfile);
router.get(
  "/dashboard",
  protect,
  authorize("seller"),
  getSellerDashboardSummary,
);
router.get(
  "/dashboard/sales-chart",
  protect,
  authorize("seller"),
  getSalesChart,
);
router.get(
  "/dashboard/top-products",
  protect,
  authorize("seller"),
  getTopProducts,
);

// Admin routes
router.get(
  "/pending-count",
  protect,
  authorize("admin"),
  getPendingSellerCount,
);
router.get("/pending", protect, authorize("admin"), getPendingSellers);
router.get("/", protect, authorize("admin"), getAllSellers);
router.put("/:id/status", protect, authorize("admin"), updateSellerStatus);

module.exports = router;
