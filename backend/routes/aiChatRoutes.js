const express = require('express');
const router = express.Router();
const {chatwithAI, getAiChatHistory} = require('../controllers/aiChatController');
const {verifyToken} = require('../controllers/SignInContoller');


router.post('/chat', verifyToken, chatwithAI); // working 

router.get('/history', verifyToken, getAiChatHistory); // working 

module.exports = router;    