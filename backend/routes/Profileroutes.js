const express = require("express")
const router = express.Router();
const { verifyToken } = require("../controllers/SignInContoller");

const {
    createOrUpdateProfile,
    getMyProfile,
} = require("../controllers/ProfileController")

router.post("/", verifyToken, createOrUpdateProfile);

router.get("/me ", verifyToken, getMyProfile);


module.exports = router;
