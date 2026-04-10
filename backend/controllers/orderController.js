const Order = require("../models/Order");
const Product = require("../models/ProductsModel");
const Coupon = require("../models/Coupon");
const razorpay = require("../utils/razorpay");

// ✅ Valid status transitions map
const ALLOWED_TRANSITIONS = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// Statuses from which cancellation triggers a refund + stock restore
const REFUNDABLE_STATUSES = ["Pending", "Processing"];

// ✅ Create a new order
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, paymentId, coupon } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products found" });
    }

    let orderProducts = [];
    let orderCoupon = null;

    // 🔥 STEP 1: Validate products & snapshot price + sellerId
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // 🚫 Prevent seller from buying their own product
      if (
        req.user.role === "seller" &&
        product.seller.toString() === req.user._id.toString()
      ) {
        return res.status(400).json({
          error: "You cannot purchase your own product",
        });
      }

      // ❌ Stock check
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`,
        });
      }

      // 🔒 Snapshot price & sellerId
      orderProducts.push({
        productId: product._id,
        sellerId: product.seller,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 🔥 STEP 2: Coupon validation
    if (coupon?.code) {
      const validCoupon = await Coupon.findOne({
        code: coupon.code.toUpperCase(),
        isActive: true,
      });

      if (!validCoupon) {
        return res.status(400).json({ error: "Invalid coupon" });
      }

      const alreadyUsed = await Order.findOne({
        user: req.user._id,
        "coupon.code": validCoupon.code,
      });

      if (alreadyUsed) {
        return res.status(400).json({
          error: "Coupon already used by this user",
        });
      }

      orderCoupon = {
        code: validCoupon.code,
        discount: coupon.discount,
      };
    }

    // 🔥 STEP 3: Deduct stock AFTER validation
    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 🔥 STEP 4: Create the order
    const newOrder = await Order.create({
      user: req.user._id,
      products: orderProducts,
      amount: totalAmount,
      transactionId: paymentId,
      coupon: orderCoupon,
      status: "Processing",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    let orders = await Order.find().sort({ createdAt: -1 }).populate({
      path: "products.productId",
      select: "name price imageUrl seller",
    });

    // 🔐 SELLER LOGIC
    if (req.user.role === "seller") {
      const sellerId = req.user._id.toString();

      orders = orders
        .map((order) => {
          const sellerProducts = order.products.filter(
            (p) => p.productId && p.productId.seller?.toString() === sellerId,
          );

          if (sellerProducts.length === 0) return null;

          return {
            _id: order._id,
            products: sellerProducts.map((p) => ({
              productId: p.productId._id,
              name: p.productId.name,
              price: p.productId.price,
              imageUrl: p.productId.imageUrl,
              quantity: p.quantity,
            })),
            amount: sellerProducts.reduce(
              (sum, p) => sum + p.productId.price * p.quantity,
              0,
            ),
            transactionId: order.transactionId,
            status: order.status,
            createdAt: order.createdAt,
          };
        })
        .filter(Boolean);
    }

    // 🛡️ ADMIN GETS EVERYTHING
    if (req.user.role === "admin") {
      orders = orders.map((order) => ({
        _id: order._id,
        products: order.products
          .filter((p) => p.productId)
          .map((p) => ({
            productId: p.productId._id,
            name: p.productId.name,
            price: p.productId.price,
            imageUrl: p.productId.imageUrl,
            quantity: p.quantity,
          })),
        amount: order.amount,
        transactionId: order.transactionId,
        status: order.status,
        createdAt: order.createdAt,
      }));
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productId",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get orders by user ID
const getOrdersByUser = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(200).json([]);

    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.productId",
        select: "name price imageUrl",
      });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      products: order.products
        .filter((p) => p.productId)
        .map((p) => ({
          productId: p.productId._id,
          name: p.productId.name,
          price: p.productId.price,
          imageUrl: p.productId.imageUrl,
          quantity: p.quantity,
        })),
      amount: order.amount,
      transactionId: order.transactionId,
      coupon: order.coupon || null,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(200).json([]);
  }
};

// ✅ Update order status (with refund + stock restore on cancellation)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "products.productId",
      "seller",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 SELLER OWNERSHIP CHECK
    if (req.user.role === "seller") {
      const sellerOwnsProduct = order.products.some(
        (p) => p.productId.seller.toString() === req.user._id.toString(),
      );

      if (!sellerOwnsProduct) {
        return res.status(403).json({
          message: "Not authorized to update this order",
        });
      }
    }

    // 🚦 STATUS TRANSITION VALIDATION
    const allowedNext = ALLOWED_TRANSITIONS[order.status];

    if (!allowedNext) {
      return res.status(400).json({
        message: `Unknown current status: ${order.status}`,
      });
    }

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message:
          allowedNext.length === 0
            ? `Order is already in a final state (${order.status}) and cannot be updated.`
            : `Invalid status transition from "${order.status}" to "${status}". Allowed: ${allowedNext.join(", ")}.`,
      });
    }

    // 💰 CANCELLATION: refund + stock restore
    if (status === "Cancelled" && REFUNDABLE_STATUSES.includes(order.status)) {
      // 🔄 STEP 1: Restore stock for every product in the order
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: +item.quantity },
        });
      }

      // 💸 STEP 2: Trigger Razorpay refund using the stored payment ID
      if (order.transactionId) {
        try {
          await razorpay.payments.refund(order.transactionId, {
            amount: Math.round(order.amount * 100), // paise
            speed: "normal", // "normal" (5-7 days) or "optimum" (instant, higher fee)
            notes: {
              reason: "Order cancelled by user/seller",
              orderId: order._id.toString(),
            },
          });
        } catch (refundError) {
          // Log the refund failure but don't block the cancellation —
          // the order status will still be set to Cancelled so ops can
          // handle manual refund if Razorpay rejects (e.g. already refunded).
          console.error(
            `Razorpay refund failed for order ${order._id}:`,
            refundError.message,
          );
        }
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
