const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);