const Wishlist = require('../models/wishlist');

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    } else {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    await wishlist.save();
    res.status(200).json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId }).populate('products');

    res.status(200).json({
      products: wishlist?.products || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove product
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    );

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
