const express = require("express");
const router = express.Router();
const { saveMessage, getMessages } = require("../controllers/MessageController");

router.post("/send", saveMessage);
router.get("/:from/:to", getMessages);

module.exports = router;