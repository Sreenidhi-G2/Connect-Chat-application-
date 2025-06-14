const express = require("express");
const { sendOtp,verifyOtp ,otpRateLimit} = require("../controllers/OtpController");
const router = express.Router();

router.post("/send-otp",otpRateLimit,sendOtp);
router.post("/login",verifyOtp);

module.exports = router;
