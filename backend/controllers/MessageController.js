  const Message = require("../models/Message");

exports.saveMessage = async (req, res) => {
  try {
    const { chatRoomId, message } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      chatRoom: chatRoomId,
      sender: senderId,
      message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    
exports.getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate("sender", "name email")
      .sort({ time: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

