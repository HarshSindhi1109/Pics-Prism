const express = require("express");
const {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  toggleCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../authmiddelware/authMiddleware");

const router = express.Router();

/* USER */
router.post("/apply", protect, authorize("buyer"), applyCoupon);

/* ADMIN */
router.post("/create", protect, authorize("admin"), createCoupon);

router.get("/all", protect, authorize("admin"), getAllCoupons);

router.patch("/toggle/:id", protect, authorize("admin"), toggleCoupon);

router.delete("/delete/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
