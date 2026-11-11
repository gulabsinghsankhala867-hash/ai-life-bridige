const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI LIFE BRIDGE Backend is running!");
});

app.post("/chat", async (req, res) => {
  const { message, language } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      reply: "Please enter a question."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      reply: "AI configuration is missing."
    });
  }

  try {
    const prompt = `
You are RUNO AI, a helpful and intelligent AI assistant.

Language rules:
- If the user writes in Hindi, reply in simple Hindi.
- If the user writes in English, reply in English.
- If the user writes in Hinglish, reply in natural Hinglish.
- Always reply in the same language and style used by the user.
- Do not introduce yourself in every reply.
Answer formatting rules:
- Give normal paragraph answers for simple questions.
- Use bullet points only when they make the answer clearer.
- Use numbered lists (1, 2, 3) for steps or instructions.
- Use clear headings for long answers.
- Keep bullet points slightly spaced apart.
- Keep paragraphs short and clean.
- Never force every answer into bullets or numbering.
User's question: ${message.trim()}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt + message.trim()
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 800
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data.error?.message || response.status);
      return res.status(502).json({
        reply: "AI सेवा अभी जवाब नहीं दे पा रही है। थोड़ी देर बाद कोशिश करें।"
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    res.json({
      reply: reply || "अभी जवाब नहीं मिला। दोबारा कोशिश करें।"
    });

  } catch (error) {
    console.error("Server error:", error.message);

    res.status(500).json({
      reply: "सर्वर में समस्या आई है। दोबारा कोशिश करें।"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI LIFE BRIDGE is running on port " + PORT);
});
