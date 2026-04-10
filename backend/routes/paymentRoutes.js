const express = require("express");
const { createPaymentOrder } = require("../controllers/paymentController");

const router = express.Router();

// POST /api/payment
router.post("/payment", createPaymentOrder);

module.exports = router;
