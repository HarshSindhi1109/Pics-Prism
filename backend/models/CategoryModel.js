const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
  },
  imageUrl: {
    type: String,
    required: [true, "Image URL is required"],
  },
  discount: {
    type: String,
    required: [true, "Discount information is required"],
    default: "0% off",
  },
});

module.exports = mongoose.model("Category", CategorySchema);
