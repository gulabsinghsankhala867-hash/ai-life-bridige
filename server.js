const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI LIFE BRIDGE Backend is running!");
});

app.post("/chat", (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({
      reply: "Please enter a question."
    });
  }

  res.json({
    reply: language === "hi"
      ? "आपका सवाल मिल गया है: " + message
      : "I received your question: " + message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI LIFE BRIDGE is running on port " + PORT);
});
