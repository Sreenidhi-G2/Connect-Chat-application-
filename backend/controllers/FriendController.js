const Friendship =require('../models/Friendship');


exports.getMyFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const friends = await Friendship.find({
            status: 'accepted',
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).populate('sender', 'username email').populate('receiver', 'username email').sort({updatedAt: -1});

        const formattedFriends = friends.map((f) => {
            const isSender = f.sender._id.toString() === userId;
            return  isSender ?  f.receiver : f.sender
        });
        res.status(200).json(formattedFriends);
    } catch (error) {
        console.error("GET FRIENDS ERROR",error);
        res.status(500).json({ message: error.message });
    }
};