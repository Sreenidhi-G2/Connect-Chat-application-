const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Get all users except the current logged-in user
exports.getAllUsers = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log(token);
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token required" 
            });
        }

        let currentUserId;
        try {
            console.log(process.env.JWT_SECRET);
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentUserId = decoded.userId;
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token" 
            });
        }

        const allUsers = await User.find({ _id: { $ne: currentUserId } })
            .select('_id username email googleId');

        res.status(200).json({ 
            success: true,
            message: "Successfully retrieved users", 
            count: allUsers.length,
            users: allUsers.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                isGoogleUser: !!user.googleId  // Flag to identify Google-authenticated users
            }))
        });
    } catch (err) {
        console.error("Error in getAllUsers:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token required" 
            });
        }

        let currentUserId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentUserId = decoded.userId;
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token" 
            });
        }

        const user = await User.findById(currentUserId)
            .select('_id username email googleId');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isGoogleUser: !!user.googleId
            }
        });
    } catch (err) {
        console.error("Error in getCurrentUser:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

// Search users by username (excluding current user)
exports.searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search || search.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: "Search query is required" 
            });
        }

        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token required" 
            });
        }

        let currentUserId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentUserId = decoded.userId;
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token" 
            });
        }

        const users = await User.find({
            _id: { $ne: currentUserId },
            username: { $regex: search.trim(), $options: 'i' }
        }).select('_id username email googleId')
          .limit(20);

        res.status(200).json({
            success: true,
            message: "Search completed successfully",
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                isGoogleUser: !!user.googleId
            }))
        });
    } catch (err) {
        console.error("Error in searchUsers:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username || username.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: "Username is required" 
            });
        }

        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token required" 
            });
        }

        let currentUserId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentUserId = decoded.userId;
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token" 
            });
        }

        const user = await User.findByIdAndUpdate(
            currentUserId,
            { username: username.trim() },
            { new: true, runValidators: true }
        ).select('_id username email googleId');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isGoogleUser: !!user.googleId
            }
        });
    } catch (err) {
        console.error("Error in updateProfile:", err);
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Username already exists" 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};