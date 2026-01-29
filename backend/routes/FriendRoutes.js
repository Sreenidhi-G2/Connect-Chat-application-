const express = require('express');
const router = express.Router();

const  {getMyFriends}  = require('../controllers/FriendController');

const { verifyToken } = require('../controllers/SignInContoller');

router.get('/myfriends', verifyToken, getMyFriends); //working 

module.exports = router;
