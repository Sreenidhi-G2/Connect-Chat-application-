const OpenAI = require("openai");
const token = process.env.OPEN_ROUTER_API_KEY;

const Llamma = new OpenAI({
    apiKey: token,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_NAME || "AI Chat App",
    },
});


module.exports = Llamma;