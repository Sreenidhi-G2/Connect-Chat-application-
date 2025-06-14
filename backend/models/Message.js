    // models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying of conversations
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, timestamp: -1 });

// Index for unread messages
messageSchema.index({ receiverId: 1, isRead: 1, timestamp: -1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.senderId, this.receiverId];
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, page = 1, limit = 50) {
  return this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ],
    isDeleted: false,
    deletedFor: { $nin: [userId1] }
  })
  .populate('senderId', 'name phoneNumber profilePicture')
  .populate('receiverId', 'name phoneNumber profilePicture')
  .populate('replyTo', 'message senderId timestamp')
  .sort({ timestamp: -1 })
  .limit(limit)
  .skip((page - 1) * limit);
};

// Static method to get user's recent conversations
messageSchema.statics.getRecentConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { senderId: mongoose.Types.ObjectId(userId) },
          { receiverId: mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false,
        deletedFor: { $nin: [mongoose.Types.ObjectId(userId)] }
      }
    },
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', mongoose.Types.ObjectId(userId)] },
            '$receiverId',
            '$senderId'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $unwind: '$otherUser'
    },
    {
      $project: {
        _id: 1,
        otherUser: {
          _id: '$otherUser._id',
          name: '$otherUser.name',
          phoneNumber: '$otherUser.phoneNumber',
          profilePicture: '$otherUser.profilePicture',
          isOnline: '$otherUser.isOnline',
          lastSeen: '$otherUser.lastSeen'
        },
        lastMessage: {
          _id: '$lastMessage._id',
          message: '$lastMessage.message',
          messageType: '$lastMessage.messageType',
          timestamp: '$lastMessage.timestamp',
          senderId: '$lastMessage.senderId',
          isRead: '$lastMessage.isRead'
        },
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.timestamp': -1 }
    }
  ]);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(senderId, receiverId) {
  return this.updateMany(
    {
      senderId: senderId,
      receiverId: receiverId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Instance method to soft delete message for a user
messageSchema.methods.deleteForUser = function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
  }
  
  // If deleted for both users, mark as completely deleted
  if (this.deletedFor.length >= 2) {
    this.isDeleted = true;
  }
  
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;