const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../authmiddelware/authMiddleware');

const router = express.Router();

// Buyer + Seller
router.post('/orders', protect, authorize('buyer', 'seller'), createOrder);
router.get('/orders/user', protect, authorize('buyer', 'seller'), getOrdersByUser);

// Seller / Admin
router.put(
  '/orders/:id',
  protect,
  authorize('seller', 'admin'),
  updateOrderStatus
);
router.get('/orders', protect, authorize('seller', 'admin'), getOrders);
router.get('/orders/:id', protect, authorize('seller', 'admin'), getOrderById);
router.delete(
  '/orders/:id',
  protect,
  authorize('seller', 'admin'),
  deleteOrder
);

module.exports = router;
