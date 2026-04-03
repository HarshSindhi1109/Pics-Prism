const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: {
      type: String,
      required: true,
      set: (v) => v.trim(),
    },

    businessType: {
      type: String,
      enum: [
        "Individual",
        "Partnership / LLP",
        "Private Limited Company",
        "Co-operative Society",
      ],
      required: true,
    },

    gstNumber: {
      type: String,
      default: null,
    },

    panNumber: {
      type: String,
      required: true,
    },

    licenseImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Seller", SellerSchema);
