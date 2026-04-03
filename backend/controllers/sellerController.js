const Seller = require("../models/Seller");
const User = require("../models/User");
const {
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
} = require("../utils/sendEmail");

/**
 * Apply to become a seller
 * POST /api/seller/apply
 */
const applyForSeller = async (req, res) => {
  try {
    const userId = req.user._id;

    const existingSeller = await Seller.findOne({ user: userId });

    if (existingSeller && existingSeller.status !== "rejected") {
      return res.status(400).json({ msg: "Seller profile already exists" });
    }

    if (existingSeller && existingSeller.status === "rejected") {
      await Seller.deleteOne({ _id: existingSeller._id });
    }

    if (!req.file) {
      return res.status(400).json({
        msg: "License image is required",
      });
    }

    if (req.body.businessType !== "Individual" && !req.body.gstNumber) {
      return res.status(400).json({
        msg: "GST number required for selected business type",
      });
    }

    const sellerData = {
      user: userId,
      storeName: req.body.storeName,
      businessType: req.body.businessType,
      gstNumber: req.body.gstNumber || null,
      panNumber: req.body.panNumber,
      licenseImageUrl: `/uploads/${req.file.filename}`,
      address: JSON.parse(req.body.address),
      bankDetails: JSON.parse(req.body.bankDetails),
      status: "pending", // pending by default
    };

    const seller = await Seller.create(sellerData);

    return res.status(201).json(seller);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Get logged-in seller profile
 * GET /api/seller/me
 */
const getMySellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id }).populate(
      "user",
      "name email",
    );

    if (!seller) {
      return res.status(404).json({ msg: "Seller profile not found" });
    }

    return res.status(200).json(seller);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Buyer: Check seller application status
 * GET /api/seller/status
 */
const getSellerStatus = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });

    // Case 1: Never applied OR rejected (seller deleted)
    if (!seller) {
      return res.status(200).json({
        canApply: true,
        status: "not_applied",
      });
    }

    // Case 2: Pending
    if (seller.status === "pending") {
      return res.status(200).json({
        canApply: false,
        status: "pending",
      });
    }

    // Case 3: Approved
    if (seller.status === "approved") {
      return res.status(200).json({
        canApply: false,
        status: "approved",
      });
    }

    // Case 4: Rejected
    if (seller.status === "rejected") {
      return res.status(200).json({
        canApply: true,
        status: "rejected",
        reason: seller.rejectionReason,
      });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

/**
 * Admin: Get pending sellers only
 * GET /api/seller/pending
 */
const getPendingSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ status: "pending" }).populate(
      "user",
      "name email",
    );

    return res.status(200).json(sellers);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Admin: Get pending seller count
 * GET /api/seller/pending-count
 */
const getPendingSellerCount = async (req, res) => {
  try {
    const count = await Seller.countDocuments({ status: "pending" });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Update seller profile
 * PUT /api/seller/me
 */
const updateSellerProfile = async (req, res) => {
  try {
    const updatedData = {
      storeName: req.body.storeName,
      businessType: req.body.businessType,
      gstNumber: req.body.gstNumber,
      panNumber: req.body.panNumber,
      address: req.body.address,
      bankDetails: req.body.bankDetails,
    };

    const seller = await Seller.findOneAndUpdate(
      { user: req.user._id },
      updatedData,
      { new: true, runValidators: true },
    );

    if (!seller) {
      return res.status(404).json({ msg: "Seller profile not found" });
    }

    return res.status(200).json(seller);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Admin: Get all sellers
 * GET /api/seller
 */
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate("user", "name email role");

    return res.status(200).json(sellers);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

/**
 * Admin: Approve or reject seller
 * PUT /api/seller/:id/status
 */
const updateSellerStatus = async (req, res) => {
  try {
    const sellerID = req.params.id;
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    // 🔑 Fetch seller WITH user data
    const seller = await Seller.findById(sellerID).populate(
      "user",
      "name email role",
    );

    if (!seller) {
      return res.status(404).json({ msg: "Seller not found" });
    }

    // APPROVE FLOW
    if (status === "approved") {
      seller.status = "approved";
      seller.rejectionReason = null;
      await seller.save();

      // upgrade role
      await User.findByIdAndUpdate(seller.user._id, {
        role: "seller",
      });

      // send approval email
      await sendSellerApprovalEmail(seller.user.email, seller.user.name);

      return res.status(200).json({
        msg: "Seller approved, role updated, email sent",
      });
    }

    // REJECT FLOW
    if (status === "rejected") {
      if (!reason || reason.trim() === "") {
        return res.status(400).json({ msg: "Rejection reason is required" });
      }

      seller.status = "rejected";
      seller.rejectionReason = reason;
      await seller.save();

      await sendSellerRejectionEmail(
        seller.user.email,
        seller.user.name,
        reason,
      );

      return res.status(200).json({
        msg: "Seller rejected, data removed, email sent",
      });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  applyForSeller,
  getMySellerProfile,
  getPendingSellers,
  updateSellerProfile,
  getAllSellers,
  updateSellerStatus,
  getPendingSellerCount,
  getSellerStatus,
};
