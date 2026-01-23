const express = require('express');
const router = express.Router();
const {chatwithAI, getAiChatHistory} = require('../controllers/aiChatController');
const {verifyToken} = require('../controllers/SignInContoller');


router.post('/chat', verifyToken, chatwithAI);

router.get('/history', verifyToken, getAiChatHistory);

module.exports = router;