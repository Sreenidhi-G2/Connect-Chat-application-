const Message = require("../models/Message");

exports.saveMessage = async (req, res) => {
  try {
    const { from, to, message, time } = req.body;
    const newMessage = new Message({ from, to, message, time });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { from, to } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }).sort({ time: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
