  const Message = require("../models/Message");

exports.saveMessage = async (req, res) => {
  try {
    const { chatRoomId, message } = req.body;
    const senderId = req.user.id;

    if(!chatRoomId || !message) {
      return res.status(400).json({ error: "Missing Fields" });
    }

    const newMessage = await Message.create({
      conversationId: chatRoomId,
      senderId,
      content: message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    
exports.getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const messages = await Message.find({ conversationId: chatRoomId })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
