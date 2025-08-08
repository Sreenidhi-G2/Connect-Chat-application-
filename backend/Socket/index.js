const Message = require("../models/Message");

function getRoomId(user1, user2) {
  return [user1, user2].sort().join("_");
}

function initSocket(io) {
  // Store online users with more detailed info
  let onlineUsers = new Map(); // userId → { socketId, currentRoom }
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    /** ---------- USER ONLINE ---------- **/
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, { 
        socketId: socket.id, 
        currentRoom: null 
      });
      
      // Store userId in socket for easy lookup
      socket.userId = userId;
      
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`User ${userId} is now online`);
    });
    
    /** ---------- JOIN ROOM ---------- **/
    socket.on("join_room", ({ user1, user2 }) => {
      const roomId = getRoomId(user1, user2);
      socket.join(roomId);
      
      // Update user's current room
      if (onlineUsers.has(user1)) {
        onlineUsers.get(user1).currentRoom = roomId;
      }
      
      console.log(`${user1} joined room ${roomId}`);
    });
    
    /** ---------- LEAVE ROOM ---------- **/
    socket.on("leave_room", ({ user1, user2 }) => {
      const roomId = getRoomId(user1, user2);
      socket.leave(roomId);
      
      // Clear user's current room
      if (onlineUsers.has(user1)) {
        onlineUsers.get(user1).currentRoom = null;
      }
      
      console.log(`${user1} left room ${roomId}`);
    });
    
    /** ---------- SEND MESSAGE ---------- **/
    socket.on("send_message", async (data) => {
      const { from, to, message, time, messageId } = data;
      const roomId = getRoomId(from, to);
      
      console.log(`📨 Processing message from ${from} to ${to} in room ${roomId}`);
      
      // Add message ID if not present
      const messageData = {
        ...data,
        messageId: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      try {
        // Save message to database first
        const newMsg = new Message({ 
          from, 
          to, 
          message, 
          time: time || new Date().toISOString(),
          messageId: messageData.messageId
        });
        
        const savedMessage = await newMsg.save();
        console.log(`💾 Message saved with ID: ${savedMessage._id}`);
        
        // Emit to room with saved message data
        const messageWithId = {
          ...messageData,
          _id: savedMessage._id.toString(),
          status: 'delivered'
        };
        
        io.to(roomId).emit("receive_message", messageWithId);
        
        // Send success confirmation to sender
        socket.emit("message_saved", { 
          messageId: messageData.messageId, 
          success: true,
          _id: savedMessage._id.toString()
        });
        
        // Check if recipient should receive notification
        const recipientUserData = onlineUsers.get(to);
        
        if (recipientUserData) {
          const recipientSocket = io.sockets.sockets.get(recipientUserData.socketId);
          const isInSameRoom = recipientUserData.currentRoom === roomId;
          
          console.log(`📱 Recipient ${to} - Online: true, InSameRoom: ${isInSameRoom}`);
          
          if (recipientSocket) {
            // Always send in-app notification
            recipientSocket.emit("new_notification", {
              from,
              to,
              message,
              time: messageData.time || new Date().toISOString(),
              messageId: messageData.messageId,
              roomId,
              isInSameRoom
            });
            
            console.log(`🔔 In-app notification sent to ${to}`);
            
            // Send browser notification if not in the same room
            if (!isInSameRoom) {
              recipientSocket.emit("browser_notification", {
                from,
                message,
                time: messageData.time || new Date().toISOString()
              });
              
              console.log(`🌐 Browser notification triggered for ${to}`);
            }
          }
        } else {
          console.log(`📱 Recipient ${to} is offline - no notification sent`);
        }
        
      } catch (err) {
        console.error("❌ Error saving message:", err.message);
        
        // Send error to sender
        socket.emit("message_saved", { 
          messageId: messageData.messageId, 
          success: false, 
          error: err.message 
        });
      }
    });
    
    /** ---------- TYPING INDICATOR ---------- **/
    socket.on("typing", ({ from, to, isTyping }) => {
      const roomId = getRoomId(from, to);
      socket.to(roomId).emit("typing", { from, isTyping });
    });
    
    /** ---------- MESSAGE READ ---------- **/
    socket.on("mark_as_read", ({ messageId, userId }) => {
      // Update message status and notify sender
      socket.broadcast.emit("message_read", { messageId, readBy: userId });
    });
    
    /** ---------- DEBUG ROOM INFO ---------- **/
    socket.on("debug_room_info", ({ user1, user2 }) => {
      const roomId = getRoomId(user1, user2);
      const room = io.sockets.adapter.rooms.get(roomId);
      const roomUsers = room ? Array.from(room) : [];
      
      socket.emit("debug_room_response", {
        roomId,
        connectedSockets: roomUsers,
        onlineUsers: Array.from(onlineUsers.entries()),
        currentSocketId: socket.id,
        user1OnlineData: onlineUsers.get(user1),
        user2OnlineData: onlineUsers.get(user2)
      });
    });
    
    /** ---------- DISCONNECT ---------- **/
    socket.on("disconnect", () => {
      console.log("User disconnecting:", socket.id);
      
      // Remove user from online users
      for (let [userId, userData] of onlineUsers.entries()) {
        if (userData.socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} removed from online users`);
          break;
        }
      }
      
      // Update online users list
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = initSocket;