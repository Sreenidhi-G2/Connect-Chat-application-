const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

// Use two dummy user names
const from = "userA";
const to = "userB";

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  
  

  // Join room between userA and userB
  socket.emit("join_room", { user1: from, user2: to });
  

  // Send test message after short delay
  setTimeout(() => {
    socket.emit("send_message", {
      from,
      to,
      message: "Hello, this is a test message from userb",
      time: new Date() // Must be a valid Date object
    });
  }, 1000);
});

socket.on("receive_message", (data) => {
  console.log("Received:", data.message,data.from);

  
});
