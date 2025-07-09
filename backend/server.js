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
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(cors({
  origin: [
    "http://localhost:5173",                 
    "https://connect-chat-application-mu.vercel.app", 
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

connectDB();


const userRoutes = require("./routes/UserRoutes");
app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api", authRoutes);           
app.use("/api", userRoutes); 


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://connect-chat-application-mu.vercel.app","http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));