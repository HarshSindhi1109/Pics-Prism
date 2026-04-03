const express = require('express');
const { protect, authorize } = require('../authmiddelware/authMiddleware');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.post('/add', protect, authorize('buyer'), addToWishlist);
router.get('/', protect, authorize('buyer'), getWishlist);
router.post('/remove', protect, authorize('buyer'), removeFromWishlist);

module.exports = router;
