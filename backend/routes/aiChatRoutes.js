const express = require('express');
const router = express.Router();
const {chatwithAI} = require('../controllers/aiChatController');
const {verifyToken} = require('../middleware/authMiddleware');


router.post('/chat', verifyToken, chatwithAI);

module.exports = router;