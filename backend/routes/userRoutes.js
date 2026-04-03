const express = require('express');
const { protect, authorize } = require('../authmiddelware/authMiddleware');
const {
  getUsers,
  loginRoute,
  adminLogin,
  googleLogin,
  addUser,
  updateUser,
  updateProfilePicture,
  deleteUser,
  updateProfile,
  changePassword,
  checkUser,
} = require('../controllers/userController');
const upload = require('../middleware/upload');

const router = express.Router();

// Public
router.post('/login', loginRoute);
router.post('/admin-login', adminLogin);
router.post('/register', addUser);
router.post('/google-login', googleLogin);
router.post('/check-user', checkUser);

router.put('/profile-picture/:id', protect, upload.single('profilePic'), updateProfilePicture);

// Admin only
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Logged user
router.put('/profile/:id', protect, updateProfile);
router.put('/profile/change-password/:id', protect, changePassword);

module.exports = router;
