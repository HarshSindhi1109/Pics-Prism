const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const connectDB = require("./db/connection");
require("dotenv").config();
const Razorpay = require("razorpay");
const productRoutes = require("./routes/productsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const blogRoutes = require("./routes/blogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const otpRoutes = require("./routes/otpRoutes");
const userRoutes = require("./routes/userRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const couponRoutes = require("./routes/couponRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const port = 5000 || process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api", otpRoutes);
app.use("/api", contactMessageRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/admin", adminDashboardRoutes);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.post("/api/payment", async (req, res) => {
      try {
        const { amount } = req.body;
        const order = await razorpay.orders.create({
          amount,
          currency: "INR",
          receipt: "order_rcptid_11",
        });

        res.json(order);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    app.listen(port, console.log("Server is connected to port " + port));
  } catch (error) {
    console.log(error);
  }
};

start();
