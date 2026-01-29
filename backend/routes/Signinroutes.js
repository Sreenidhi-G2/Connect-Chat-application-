const express = require('express');
const router = express.Router();
const {
  googleSignIn,
  verifyToken,
  getProfile,
  devSignIn
} = require("../controllers/SignInContoller");

// Public routes
router.post('/google-signin', googleSignIn);

// Protected routes
router.get('/profile', verifyToken, getProfile);


// In your router file
router.post('/dev-signin', devSignIn);  // Development only // Working 

module.exports = router;