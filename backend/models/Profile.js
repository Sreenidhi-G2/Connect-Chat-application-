const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    bio: {
      type: String,
      maxlength: 300
    },

    interests: {
      type: [String],
      required: true
    },

    hobbies: {
      type: [String],
      required: true
    },

    Profession :{
      type : [String],
      required :true
    },

    profileImage: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);
