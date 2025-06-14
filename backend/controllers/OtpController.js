const Otp = require("../models/Otp");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const twilio = require('twilio');
const rateLimit = require('express-rate-limit');

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Verify Twilio credentials
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio credentials are not set in environment variables');
    console.error('Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    process.exit(1);
}

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: "Too many OTP requests from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Phone number validation for Indian and international numbers
const isValidPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check length (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return false;
    }
    
    // Check for Indian mobile numbers (10 digits starting with 6-9)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        return true;
    }
    
    // Check for international format
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
};

// Normalize phone number to E.164 format
const normalizePhoneNumber = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/[^\d\+]/g, '');
    
    if (!cleaned.startsWith('+')) {
        if (cleaned.length === 10) {
            // Check if it's an Indian mobile number
            if (/^[6-9]/.test(cleaned)) {
                cleaned = '+91' + cleaned;
            } else {
                // Assume US number
                cleaned = '+1' + cleaned;
            }
        } else if (cleaned.length === 11 && cleaned.startsWith('91')) {
            cleaned = '+' + cleaned;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = '+' + cleaned;
        } else {
            cleaned = '+' + cleaned;
        }
    }
    
    return cleaned;
};

// Generate cryptographically secure 6-digit OTP
const generateSecureOTP = () => {
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(3);
    const otp = parseInt(randomBytes.toString('hex'), 16) % 900000 + 100000;
    return otp.toString();
};

// Send OTP Function
exports.sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    
    // Input validation
    if (!phoneNumber) {
        return res.status(400).json({ 
            success: false,
            error: "Phone number is required" 
        });
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
            success: false,
            error: "Invalid phone number format" 
        });
    }
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    try {
        // Check for recent OTP requests (prevent spam - 1 minute cooldown)
        const recentOtp = await Otp.findOne({ 
            phoneNumber: normalizedPhone,
            createdAt: { $gte: new Date(Date.now() - 60000) } 
        });
        
        if (recentOtp) {
            return res.status(429).json({ 
                success: false,
                error: "Please wait 1 minute before requesting another OTP",
                remainingTime: Math.ceil((60000 - (Date.now() - recentOtp.createdAt.getTime())) / 1000)
            });
        }
        
        // Generate secure OTP
        const otpCode = generateSecureOTP();
        
        // Delete any existing OTP for this phone number to avoid unique constraint issues
        await Otp.deleteMany({ phoneNumber: normalizedPhone });
        
        // Create new OTP record
        const newOtp = await Otp.create({ 
            phoneNumber: normalizedPhone, 
            otp: otpCode
        });
        
        console.log(`Sending OTP to: ${normalizedPhone}`);
        
        // Log OTP in development mode only
        if (process.env.NODE_ENV === 'development') {
            console.log(`Generated OTP: ${otpCode}`);
        }
        
        // Prepare SMS message
        const isIndianNumber = normalizedPhone.startsWith('+91');
        const smsMessage = `Your Connect verification code is: ${otpCode}\n\nThis code expires in 5 minutes. Do not share this code with anyone.\n\nIf you didn't request this, please ignore this message.`;
        
        // Send SMS via Twilio
        const message = await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: normalizedPhone
        });
        
        console.log('SMS sent successfully. Message SID:', message.sid);
        
        // Return success response
        res.status(200).json({ 
            success: true,
            message: "Verification code sent successfully",
            data: {
                phoneNumber: normalizedPhone.replace(/(\+\d{1,3})\d{6}(\d{4})/, '$1******$2'), // Masked
                expiresIn: "5 minutes",
                country: isIndianNumber ? 'IN' : 'Other'
            }
        });
        
    } catch (err) {
        console.error("Error sending OTP:", err);
            
        // Handle specific Twilio errors
        if (err.code) {
            let errorMessage = "Failed to send verification code";
            
            switch (err.code) {
                case 21211:
                    errorMessage = "Invalid phone number format";
                    break;
                case 21614:
                    errorMessage = "Phone number is not valid for SMS";
                    break;
                case 21408:
                    errorMessage = "Permission denied for this phone number";
                    break;
                case 21610:
                    errorMessage = "Phone number is blacklisted";
                    break;
                case 30006:
                    errorMessage = "Message blocked by carrier";
                    break;
            }
            
            return res.status(400).json({ 
                success: false,
                error: errorMessage 
            });
        }
        
        // Handle MongoDB errors
        if (err.code === 11000) {
            // This shouldn't happen now that we delete existing OTPs first
            console.error("Unexpected duplicate key error:", err);
            return res.status(500).json({ 
                success: false,
                error: "Database error occurred. Please try again." 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: "SMS service temporarily unavailable",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Verify OTP Function
exports.verifyOtp = async (req, res) => {
    const { username,phoneNumber, otp } = req.body;
    
    // Input validation
    if (!phoneNumber || !otp) {
        return res.status(400).json({ 
            success: false,
            message: "Phone number and OTP are required" 
        });
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid phone number format" 
        });
    }
    
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ 
            success: false,
            message: "OTP must be 6 digits" 
        });
    }
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    try {
        console.log(`Verifying OTP for phone: ${normalizedPhone}`);
        
        // Find the OTP record
        const otpRecord = await Otp.findOne({ 
            phoneNumber: normalizedPhone, 
            otp: otp 
        });
        
        if (!otpRecord) {
            console.log(`Invalid OTP attempt for ${normalizedPhone}`);
            return res.status(400).json({ 
                success: false,
                message: "Invalid verification code" 
            });
        }
        
        // Check if OTP is expired (it should auto-expire after 5 minutes due to schema TTL)
        // But let's add an extra check for safety
        const otpAge = Date.now() - otpRecord.createdAt.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        
        if (otpAge > fiveMinutesInMs) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false,
                message: "Verification code has expired" 
            });
        }
        
        // OTP is valid, delete it to prevent reuse
        await Otp.deleteOne({ _id: otpRecord._id });
        
        // Check if user already exists
        let user = await User.findOne({ phoneNumber: normalizedPhone });
        
        if (!user) {
            // Create new user
        
            
            user = await User.create({
                phoneNumber: normalizedPhone,
                username,
                isVerified: true,
                createdAt: new Date(),
                lastLogin: new Date()
            });
            
            console.log("New user created:", normalizedPhone);
        } else {
            // Update existing user
            user.isVerified = true;
            user.lastLogin = new Date();
            await user.save();
            
            console.log("Existing user verified:", normalizedPhone);
        }
        
        // Generate JWT token
        const tokenPayload = {
            phoneNumber: user.phoneNumber,
            userId: user._id,
            username: user.username,
            isVerified: user.isVerified,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { 
                expiresIn: "7d", // 7 days token validity
                issuer: "connect-app",
                audience: "connect-users"
            }
        );
        
        // Return success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    username: user.username,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                },
                tokenExpiresIn: "7d"
            }
        });
        
        console.log(`User ${normalizedPhone} successfully authenticated`);
        
    } catch (err) {
        console.error("Error in verifyOtp:", err);
        res.status(500).json({ 
            success: false,
            message: "Authentication service temporarily unavailable",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Helper function to clean up expired OTPs manually (optional)
exports.cleanupExpiredOtps = async () => {
    try {
        const result = await Otp.deleteMany({
            createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) }
        });
        console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
    } catch (err) {
        console.error("Error cleaning up expired OTPs:", err);
    }
};
// Export rate limiting middleware
exports.otpRateLimit = otpRateLimit;    