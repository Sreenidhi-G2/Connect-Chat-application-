const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';





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
        username: user.username,
        onboardingcompleted: user.onboardingCompleted
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
    req.user =
    {
      id: decoded.userId,
      email: decoded.email
    }
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



const devSignIn = async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Development endpoint only'
    });
  }

  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Simulate Google's payload structure
    const mockGooglePayload = {
      sub: `dev-google-id-${Date.now()}`,
      email: email,
      email_verified: true,
      name: name || email.split('@')[0],
      given_name: name || 'Dev',
      family_name: 'User',
      picture: null
    };

    const { sub: googleId, email: userEmail, name: userName } = mockGooglePayload;

    // Find or create user (using your existing logic)
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = new User({
        googleId,
        email: userEmail,
        username: userName || userEmail.split('@')[0]
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Generate real JWT (same as production)
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
        username: user.username,
        onboardingcompleted: user.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Dev Sign-In Error:', error);
    res.status(500).json({
      success: false,
      error: 'Development sign-in failed'
    });
  }
};

module.exports = {
  googleSignIn,
  verifyToken,
  getProfile,
  devSignIn
};