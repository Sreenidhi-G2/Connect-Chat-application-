const Message = require("../models/Message");

function getRoomId(user1, user2) {
  return [user1, user2].sort().join("_");
}

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ user1, user2 }) => {
      const roomId = getRoomId(user1, user2);
      socket.join(roomId);
      console.log(`${user1} joined room ${roomId}`);
    });

    socket.on("send_message", async (data) => {
      const { from, to, message, time } = data;
      const roomId = getRoomId(from, to);
        console.log(data.message);
        
      io.to(roomId).emit("receive_message", data);

      try {
        const newMsg = new Message({ from, to, message, time });
        await newMsg.save();
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });
  });
}

module.exports = initSocket;