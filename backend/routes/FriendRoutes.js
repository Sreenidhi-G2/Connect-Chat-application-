const express =    require('express');
const router =     express.Router();

const {getMyfriends} = require('../controllers/FriendController');

const {verifyToken} = require('../controllers/SignInContoller');

router.get('/myfriends', verifyToken, getMyfriends);

module.exports = router;
