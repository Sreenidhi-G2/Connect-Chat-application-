const express = require("express")
const router = express.Router();

const { getMatches } = require("../controllers/MatchController");
const { verifyToken } = require("../controllers/SignInContoller");

router.get("/", verifyToken, getMatches);


module.exports = router;


