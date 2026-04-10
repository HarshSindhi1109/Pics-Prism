const razorpay = require("../utils/razorpay");

// POST /api/payment
const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const order = await razorpay.orders.create({
      amount, // in paise (already multiplied by 100 on frontend)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (error) {
    console.error("Payment order creation error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaymentOrder };
