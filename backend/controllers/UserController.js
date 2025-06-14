const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json({ 
            message: "Successfully retrieved users", 
            users: allUsers 
        });
    } catch (err) {
        console.error("Error in getAllUsers:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "User retrieved successfully",
            user
        });
    } catch (err) {
        console.error("Error in getUserById:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const user = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "User updated successfully",
            user
        });
    } catch (err) {
        console.error("Error in updateUser:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        console.error("Error in deleteUser:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};