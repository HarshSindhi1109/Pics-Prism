const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const connectDB = require("./db/connection");
require("dotenv").config();

const productRoutes = require("./routes/productsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const otpRoutes = require("./routes/otpRoutes");
const userRoutes = require("./routes/userRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const couponRoutes = require("./routes/couponRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api", otpRoutes);
app.use("/api", contactMessageRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api", paymentRoutes);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log("Server is connected to port " + port));
  } catch (error) {
    console.log(error);
  }
};

start();
