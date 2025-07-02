const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET|| "8f8c9e1ac48f4dbcb8c72892f15f327b4cf4e5e2960d91d1751d1b4b84723861"
const JWT_EXPIRES_IN = '7d';
console.log(JWT_SECRET);


const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google ID token is required' 
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email_verified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Google token or email not verified' 
      });
    }

    const { sub: googleId, email, name } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        googleId,
        email,
        username: name || email.split('@')[0]
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-googleId');
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching profile' 
    });
  }
};

module.exports = {
  googleSignIn,
  verifyToken,
  getProfile
};