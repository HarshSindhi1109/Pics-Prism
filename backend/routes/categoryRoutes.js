const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../authmiddelware/authMiddleware');
const {
  addCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryControllers');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Public
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  addCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateCategory
);

router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
