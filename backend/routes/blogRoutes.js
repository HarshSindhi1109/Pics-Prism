const express = require('express');
const {
  addBlogs,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../authmiddelware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getBlogs);
router.get('/:id', getBlog);

// Admin only
router.post('/', protect, authorize('admin'), upload.single('image'), addBlogs);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateBlog
);

router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
