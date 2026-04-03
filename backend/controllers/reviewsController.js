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

const addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { review, rating, product } = req.body;

    if (!product) {
      return res
        .status(400)
        .json({ success: false, error: "Product is required" });
    }

    const existingReview = await Review.findOne({ user: userId, product });
    if (existingReview) {
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
      return res.status(400).json({
        success: false,
        error: "Rating must be between 0.5 and 5 in steps of 0.5",
      });
    }

    if (req.file) {
      const imagePath = req.file.path;
      const safe = await isImageSafe(imagePath);

      if (!safe) {
        fs.unlinkSync(imagePath); // delete unsafe image
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
    console.error("Add review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
          as: "productInfo", // Change to a different name to avoid conflict
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
            // Keep the original product ID reference
            _id: "$product",
            name: "$productInfo.name", // Get name from productInfo
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
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

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getReview = async (req, res) => {
  try {
    const reviewID = req.params.id;

    const review = await Review.findById(reviewID);

    if (!review) {
      return res.status(404).json({
        success: false,
        msg: `No review found with id: ${reviewID}`,
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewID = req.params.id;
    const { review, rating } = req.body;

    const existingReview = await Review.findById(reviewID);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        msg: "Review not found",
      });
    }

    // ✅ Optional rating validation
    if (rating !== undefined) {
      const ratingValue = parseFloat(rating);

      if (
        isNaN(ratingValue) ||
        ratingValue < 0.5 ||
        ratingValue > 5 ||
        !Number.isInteger(ratingValue * 2)
      ) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 0.5 and 5 in steps of 0.5",
        });
      }

      existingReview.rating = ratingValue;
    }

    if (review !== undefined) {
      existingReview.review = review;
    }

    if (req.file) {
      existingReview.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    if (req.file) {
      const imagePath = req.file.path;
      const safe = await isImageSafe(imagePath);

      if (!safe) {
        fs.unlinkSync(imagePath); // delete unsafe image
        return res.status(400).json({
          success: false,
          error: "Inappropriate image detected. Upload rejected.",
        });
      }
    }

    await existingReview.save();

    await updateProductRatings(existingReview.product);

    res.status(200).json({
      success: true,
      review: existingReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewID = req.params.id;

    const deletedReview = await Review.findByIdAndDelete(reviewID);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        msg: `No review found with id: ${reviewID}`,
      });
    }

    await updateProductRatings(deletedReview.product);

    res.status(200).json({
      success: true,
      msg: "Review deleted successfully",
      deletedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
