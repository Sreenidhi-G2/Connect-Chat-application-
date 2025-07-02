const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/Messageroutes");  
const initSocket = require("./Socket/index");
const authRoutes = require('./routes/Signinroutes');

require("dotenv").config();
const app = express();
app.use(cors());
connectDB();


const userRoutes = require("./routes/UserRoutes");
app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api", authRoutes);            // For OTP auth
app.use("/api", userRoutes); 


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));