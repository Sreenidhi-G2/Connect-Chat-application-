// routes/MessageRoutes.js
const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');

// Middleware to verify authentication (you can use your existing auth middleware)
const authMiddleware = (req, res, next) => {
  // Add your authentication logic here
  // For now, we'll assume the user is authenticated
  // You can integrate this with your existing OTP/JWT authentication
  next();
};

// Get conversation between two users
// GET /api/messages/conversation/:userId1/:userId2?page=1&limit=50
router.get('/conversation/:userId1/:userId2', authMiddleware, MessageController.getConversation);

// Get user's recent conversations/chats
// GET /api/messages/conversations/:userId
router.get('/conversations/:userId', authMiddleware, MessageController.getRecentConversations);

// Get unread message count for a user
// GET /api/messages/unread-count/:userId
router.get('/unread-count/:userId', authMiddleware, MessageController.getUnreadCount);

// Search messages for a user
// GET /api/messages/search/:userId?query=searchTerm&page=1&limit=20
router.get('/search/:userId', authMiddleware, MessageController.searchMessages);

// Delete a message
// DELETE /api/messages/:messageId
router.delete('/:messageId', authMiddleware, MessageController.deleteMessage);

// Health check for messages API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Messages API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;