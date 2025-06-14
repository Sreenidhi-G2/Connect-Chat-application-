const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Otproute=require("./routes/Otproutes")

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api",Otproute);

app.get("/", (req, res) => res.send("Backend  running"));

module.exports = app;
