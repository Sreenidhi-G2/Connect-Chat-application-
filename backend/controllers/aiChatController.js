const replicate = require("../config/LLM");
const AiMessage = require("../models/AiMessage");

exports.chatwithAI = async (req, res) => {

    try {
        const { message } = req.body;
        const userId = req.user.id;

        const model = process.env.MODEL_VERSION;

        if (!message) {
            return res.status(400).json({ error: "Message is required " });
        }

        const prompt = `You are a friendly, empathetic AI friend. You talk casually, supportive, and human - like. Never sound robotic.User message: "${message}"
        AI response:`;

        await AiMessage.create({
            userId,
            role: "user",
            content: message,
        });

        const history = await AiMessage.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();



        const output = await replicate.run(
            model,
            {
                input: {
                    prompt,
                    max_tokens: 300,
                    temperature: 0.7,
                    top_p: 0.9,
                }
            }
        );



        const aiReply = Array.isArray(output) ? output.join("") : output;

        await AiMessage.create({
            userId,
            role: "assistant",
            content: aiReply,
        });

        res.status(200).json({ success: true, reply: aiReply.trim() });



    } catch (error) {
        console.error("Error communicating with AI model:", error);
        res.status(500).json({ success: false, error: "Failed to get response from AI model" });

    }
}

exports.getAiChatHistory = async (req, res) => {
  try {
    const messages = await AiMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
