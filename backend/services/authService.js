const jwt = require('jsonwebtoken');
const User = require('../models/User');

const loginUser = async ({ email, loginType }) => {
  const user = await User.findOne({ email }).select('-password');
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Role-based validation
  if (loginType === 'buyer' && user.role === 'seller') {
    throw new Error('SELLER_LOGIN_BLOCKED');
  }

  if (loginType === 'seller' && user.role !== 'seller') {
    throw new Error('NOT_APPROVED_SELLER');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
};

module.exports = { loginUser };
