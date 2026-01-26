const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],

    lastMessage: {
      type: String
    },

    lastMessageAt: {
      type: Date
    },

    isGroup: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
