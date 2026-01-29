const express = require('express');
const router = express.Router();
const { getAllUsers, getCurrentUser, searchUsers, updateProfile } = require('../controllers/UserController');
const {verifyToken} = require('../controllers/SignInContoller');

// Get all users (excluding current user)
router.get('/allusers',verifyToken, getAllUsers);


// Search users by username
router.get('/search',verifyToken, searchUsers);

// Update current user's profile
router.put('/profile', verifyToken ,updateProfile);

module.exports = router;