const mongoose  = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})