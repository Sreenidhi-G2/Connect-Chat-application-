// auth.js routes (or wherever your OTP routes are)
const express = require('express');
const router = express.Router();
const { checkUser, sendOtp, verifyOtp, otpRateLimit } = require('../controllers/OtpController');

// Check if user exists before sending OTP
router.post('/check-user', checkUser);

// Send OTP (with rate limiting)
router.post('/send-otp', otpRateLimit, sendOtp);

// Verify OTP
router.post('/login', verifyOtp);

module.exports = router;