// Load environment variables FIRST - before any other imports
require('dotenv').config();

// Now import other modules
const connectDB = require("./config/db");
const app = require("./app");

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));