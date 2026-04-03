const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Must Enter a Name..."],
    },
    price: {
      type: Number,
      required: [true, "Must be a number..."],
      min: 0, // Ensure the price is non-negative
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ratings: {
      type: Number,
      min: 0.0, // Minimum rating
      max: 5.0, // Maximum rating
      default: 0.0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required..."],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Assuming you have a Category model
      required: [true, "Category is required..."],
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
