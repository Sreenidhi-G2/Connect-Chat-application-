const express = require('express');
const router = express.Router();
const { getAllUsers, getCurrentUser, searchUsers, updateProfile } = require('../controllers/UserController');

// Get all users (excluding current user)
router.get('/allusers', getAllUsers);

// Get current user info
router.get('/me', getCurrentUser);

// Search users by username
router.get('/search', searchUsers);

// Update current user's profile
router.put('/profile', updateProfile);

module.exports = router;