const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  from: { type: String, ref: "User", required: true },
  to: { type: String, ref: "User", required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);