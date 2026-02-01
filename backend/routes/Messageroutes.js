const express = require("express");
const router = express.Router();
const { saveMessage, getMessages } = require("../controllers/MessageController");
const { verifyToken } = require("../controllers/SignInContoller");

router.post("/:chatRoomId",verifyToken, saveMessage);
router.get("/:chatRoomId", verifyToken,getMessages);

module.exports = router;