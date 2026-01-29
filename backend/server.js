require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/Messageroutes");
const initSocket = require("./Socket/index");
const ProfileRoutes = require("./routes/Profileroutes");
const MatchRoutes = require("./routes/Matchroutes");
const authRoutes = require('./routes/Signinroutes');
const aiChatRoutes = require("./routes/aiChatRoutes");
const friendRoutes = require("./routes/FriendRoutes");
const userRoutes = require("./routes/UserRoutes");






const app = express();
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://connect-chat-application-mu.vercel.app",
    "http://connect-chat-application.s3-website.ap-south-1.amazonaws.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

connectDB();



app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api", MatchRoutes);
app.use("/api/ai", aiChatRoutes);
app.use("/api/friends", friendRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://connect-chat-application-mu.vercel.app", "http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));