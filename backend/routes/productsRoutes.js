const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect, authorize } = require("../authmiddelware/authMiddleware");
const {
  addProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} = require("../controllers/productsControllers");
const products = require("../models/ProductsModel");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Public
router.get("/", getProducts);
router.get("/my", protect, authorize("seller", "admin"), async (req, res) => {
  const myProducts = await products.find({ seller: req.user.id });
  res.json(myProducts);
});
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProduct);

// Seller/Admin
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.single("image"),
  addProducts,
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.single("image"),
  updateProduct,
);

// Admin only
router.delete("/:id", protect, authorize("admin", "seller"), deleteProduct);

module.exports = router;
