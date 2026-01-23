const mongoose = require('mongoose');

const AiMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
},
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("AiMessage", AiMessageSchema);