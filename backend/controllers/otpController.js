const Otp = require('../models/OtpModel');
const { generateOTP } = require('../utils/otp');
const { sendOTP } = require('../utils/sendEmail');
const { loginUser } = require('../services/authService');

const sendOtpCon = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    const existingOtp = await Otp.findOne({ email, purpose });

    if (existingOtp && existingOtp.expiresAt > Date.now()) {
      return res.status(400).json({
        message: 'OTP already sent. Please wait before resending.',
      });
    }

    // 🧹 Only delete AFTER expiry
    await Otp.deleteMany({ email, purpose });

    const otpValue = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 1000);

    const otpDoc = await Otp.create({
      email,
      otp: otpValue,
      purpose,
      expiresAt,
    });

    await sendOTP(email, otpValue);

    return res.status(200).json({
      message: 'OTP sent to email',
      expiresAt: otpDoc.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose, loginType } = req.body;

    // ✅ Explicit validation
    if (!email || !otp || !purpose) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1️⃣ Validate OTP
    const record = await Otp.findOne({ email, otp, purpose });
    if (!record) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // 2️⃣ PURPOSE-BASED FLOW
    if (purpose === 'register') {
      await Otp.deleteMany({ email });

      // 🔑 Only verify OTP, user creation stays in userController
      return res.status(200).json({
        message: 'OTP verified successfully',
        verified: true,
      });
    }

    if (purpose === 'login') {
      if (!loginType) {
        return res
          .status(400)
          .json({ message: 'loginType is required for login' });
      }

      // ✅ Delegate auth logic
      const { user, token } = await loginUser({ email, loginType });

      await Otp.deleteMany({ email });

      return res.status(200).json({
        message: 'OTP verified successfully',
        token,
        user,
      });
    }

    return res.status(400).json({ message: 'Invalid OTP purpose' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'OTP verification failed' });
  }
};

module.exports = { sendOtpCon, verifyOtp };
