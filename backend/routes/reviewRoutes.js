const express = require("express");
const { protect, authorize } = require("../authmiddelware/authMiddleware");
const {
  addReview,
  getReview,
  getMyReviews,
  getReviews,
  getSellerProductReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewsController");

const router = express.Router();
const upload = require("../middleware/upload"); // use your upload.js

router.get("/my", protect, authorize("buyer"), getMyReviews);

router.get("/seller", protect, authorize("seller"), getSellerProductReviews);

// Public
router.get("/", getReviews);
router.get("/:id", getReview);

// 🔥 PRODUCT-SCOPED REVIEW ROUTE
router.post(
  "/",
  protect,
  authorize("buyer"),
  upload.single("imageFile"), // uses correct storage
  addReview,
);

router.put(
  "/:id",
  protect,
  authorize("buyer"),
  upload.single("imageFile"),
  updateReview,
);
router.delete("/:id", protect, authorize("buyer"), deleteReview);

module.exports = router;
