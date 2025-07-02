const express = require('express');
const router = express.Router();
const { 
  googleSignIn, 
  verifyToken, 
  getProfile 
} = require("../controllers/SignInContoller");

// Public routes
router.post('/google-signin', googleSignIn);

// Protected routes
router.get('/profile', verifyToken, getProfile);

module.exports = router;