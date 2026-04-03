const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const couponsWithStatus = coupons.map((coupon) => {
      const couponObj = coupon.toObject();
      const now = new Date();

      couponObj.isExpired = now > coupon.expiryDate;
      couponObj.isUsable = coupon.isActive && !couponObj.isExpired;

      return couponObj;
    });
    res.status(200).json(couponsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ error: "Cannot enable an expired coupon" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ error: "Invalid Coupon Or Coupon Not Found" });
    }

    const alreadyUsed = await Order.findOne({
      user: userId,
      "coupon.code": coupon.code,
    });

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ error: "Coupon Expired" });
    }

    if (alreadyUsed) {
      return res.status(400).json({
        error: "You have already used this coupon",
      });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order ₹${coupon.minOrderAmount} required`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "PERCENT") {
      discount = (orderAmount * coupon.discountValue) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = orderAmount - discount;

    res.status(200).json({
      success: true,
      discount,
      finalAmount,
      couponCode: coupon.code,
      discountType: coupon.discountType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  toggleCoupon,
  deleteCoupon,
  applyCoupon,
};
