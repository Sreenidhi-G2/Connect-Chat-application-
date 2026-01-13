const MessageRequest = require("../models/MessageRequest");
const ChatRoom = require("../models/ChatRoom");

exports.SendRequest = async (req, res) => {
    try {

        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot send Request to Yourself" });
        }

        const existing = await MessageRequest.findOne({
            senderId,
            receiverId
        });

        if (existing) {
            return res.status(400).json({ message: "Request Already Sent" });
        }

        const request = await MessageRequest.create({
            senderId,
            receiverId
        });

        res.status(201).json(request);

    } catch (error) {
        return res.status(500).json({ message: " Server Error" });
    }

    exports.respondRequest = async (req, res) => {
        try {
            const { requestId, status } = req.body;

            const request = await MessageRequest.findById(requestId);

            if (!request) {
                return res.status(404).json({ message: " Request not Found" });
            }

            if (request.receiverId.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            request.status = status;
            await request.save();

            let chatRoom = null;

            if (status === "ACCEPTED") {
                chatRoom = await ChatRoom.create({
                    users: [request.senderId, request.receiverId]
                });
            }

            res.status(200).json({ request, chatRoom });

        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }


}