const express = require('express');
const { sendOtpCon, verifyOtp } = require('../controllers/otpController');
const router = express.Router();

router.post('/send-otp', sendOtpCon);
router.post('/verify-otp', verifyOtp);

module.exports = router;
