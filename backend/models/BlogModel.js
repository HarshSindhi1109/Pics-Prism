const mongoose = require("mongoose");

const BlogSchema = mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: [true, "Image Url is required.... "],
  },
});

module.exports = mongoose.model("Blog", BlogSchema);
