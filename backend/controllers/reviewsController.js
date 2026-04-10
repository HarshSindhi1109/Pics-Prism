const Review = require("../models/ReviewsModel");
const Product = require("../models/ProductsModel");
const fs = require("fs");
const isImageSafe = require("../utils/imageModeration");

const updateProductRatings = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numOfReviews = reviews.length;
  const ratings =
    numOfReviews === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / numOfReviews;

  await Product.findByIdAndUpdate(productId, {
    numOfReviews,
    ratings: Number(ratings.toFixed(1)),
  });
};

// ✅ Helper — safely delete uploaded file without crashing if it's already gone
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Failed to delete file:", filePath, e.message);
  }
};

const addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { review, rating, product } = req.body;

    if (!product) {
      safeUnlink(req.file?.path);
      return res
        .status(400)
        .json({ success: false, error: "Product is required" });
    }

    const existingReview = await Review.findOne({ user: userId, product });
    if (existingReview) {
      safeUnlink(req.file?.path);
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const ratingValue = parseFloat(rating);
    if (
      isNaN(ratingValue) ||
      ratingValue < 0.5 ||
      ratingValue > 5 ||
      !Number.isInteger(ratingValue * 2)
    ) {
      safeUnlink(req.file?.path);
      return res.status(400).json({
        success: false,
        error: "Rating must be between 0.5 and 5 in steps of 0.5",
      });
    }

    // 🔐 IMAGE MODERATION
    if (req.file) {
      let safe = false;
      try {
        safe = await isImageSafe(req.file.path);
      } catch (moderationErr) {
        // Moderation service itself crashed — reject the upload safely
        console.error("Image moderation error:", moderationErr.message);
        safeUnlink(req.file.path);
        return res.status(500).json({
          success: false,
          error: "Internal Server Error",
        });
      }

      if (!safe) {
        safeUnlink(req.file.path);
        return res.status(400).json({
          success: false,
          error: "Inappropriate image detected. Upload rejected.",
        });
      }
    }

    const newReview = await Review.create({
      user: req.user._id,
      name: req.user.name,
      product,
      review,
      rating: ratingValue,
      imageUrl: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",
    });

    await updateProductRatings(product);

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    // ✅ Catch-all — server will NEVER crash, always returns 500 to frontend
    console.error("Add review error:", error);
    safeUnlink(req.file?.path);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.aggregate([
      { $sample: { size: 10 } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          review: 1,
          rating: 1,
          name: 1,
          imageUrl: 1,
          createdAt: 1,
          product: {
            _id: "$product",
            name: "$productInfo.name",
          },
        },
      },
    ]);

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getSellerProductReviews = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ seller: sellerId }).select("_id");
    const productIds = products.map((p) => p._id);

    const rawReviews = await Review.find({ product: { $in: productIds } })
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    const reviews = rawReviews.map((r) => ({
      ...r._doc,
      displayName: r.user?.name || r.name || "Anonymous User",
    }));

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({
          success: false,
          msg: `No review found with id: ${req.params.id}`,
        });
    }
    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const updateReview = async (req, res) => {
  try {
    const existingReview = await Review.findById(req.params.id);

    if (!existingReview) {
      safeUnlink(req.file?.path);
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }

    // ✅ Optional rating validation
    if (req.body.rating !== undefined) {
      const ratingValue = parseFloat(req.body.rating);
      if (
        isNaN(ratingValue) ||
        ratingValue < 0.5 ||
        ratingValue > 5 ||
        !Number.isInteger(ratingValue * 2)
      ) {
        safeUnlink(req.file?.path);
        return res.status(400).json({
          success: false,
          error: "Rating must be between 0.5 and 5 in steps of 0.5",
        });
      }
      existingReview.rating = ratingValue;
    }

    if (req.body.review !== undefined) {
      existingReview.review = req.body.review;
    }

    // 🔐 IMAGE MODERATION on update
    if (req.file) {
      let safe = false;
      try {
        safe = await isImageSafe(req.file.path);
      } catch (moderationErr) {
        console.error("Image moderation error:", moderationErr.message);
        safeUnlink(req.file.path);
        return res.status(500).json({
          success: false,
          error: "Internal Server Error",
        });
      }

      if (!safe) {
        safeUnlink(req.file.path);
        return res.status(400).json({
          success: false,
          error: "Inappropriate image detected. Upload rejected.",
        });
      }

      existingReview.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await existingReview.save();
    await updateProductRatings(existingReview.product);

    res.status(200).json({ success: true, review: existingReview });
  } catch (error) {
    console.error("Update review error:", error);
    safeUnlink(req.file?.path);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        msg: `No review found with id: ${req.params.id}`,
      });
    }

    await updateProductRatings(deletedReview.product);

    res.status(200).json({
      success: true,
      msg: "Review deleted successfully",
      deletedReview,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  addReview,
  getReviews,
  getMyReviews,
  getSellerProductReviews,
  getReview,
  updateReview,
  deleteReview,
};
