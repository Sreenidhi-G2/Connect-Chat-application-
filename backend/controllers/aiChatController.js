const replicate = require("../config/LLM");

exports.chatwithAI = async (req, res) => {

    try {
        const { message } = req.body;

        const model = process.env.REPLICATE_MODEL_ID;

        if (!message) {
            return res.status(400).json({ error: "Message is required " });
        }

        const propmt = `You are a friendly, empathetic AI friend. You talk casually, supportive, and human - like. Never sound robotic.User message: "${message}"
        AI response:`;

        const output = await replicate.run(
            model,
            {
                input : {
                    prompt,
                    max_tokens : 300,
                    temperature : 0.7,
                    top_p : 0.9,
                }
            }
        );

        const aiReply = Array.isArray(output) ? output.join("") : output;

        res.status(200).json({ success : true ,reply: aiReply.trim() });

     

    } catch (error) {
        console.error("Error communicating with AI model:", error);
        res.status(500).json({ success : false, error: "Failed to get response from AI model" });

    }
}