import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let chatHistory = [];

io.on("connection", (socket) => {
  console.log("Student connected:", socket.id);

  // Send past messages to the connected student
  socket.emit("chat-history", chatHistory);

  socket.on("send-message", (data) => {
    chatHistory.push(data);
    io.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Student disconnected:", socket.id);
  });
});

app.post("/api/generate-notes", async (req, res) => {
  try {
    const { outlineText, subject, detailLevel } = req.body || {};

    if (!outlineText && !subject) {
      return res
        .status(400)
        .json({ error: "Outline text or subject is required." });
    }
    const prompt = `
You are an elite university professor and academic content architect. A student is preparing for their main exams in: "${subject}".
    Here is their course outline/syllabus:
    """
    ${outlineText}
    """
    
    Requested Depth: ${detailLevel || "comprehensive"}.

    Your task is to generate comprehensive, rigorous, full-length LECTURE NOTES for this entire course. Do not summarize briefly; write exhaustive, in-depth explanations for every module so a student can completely master the subject without extra textbooks.

    You MUST respond ONLY with a valid JSON object matching this exact structure:
    {
      "title": "SUBJECT TITLE UPPERCASE",
      "subtitle": "Comprehensive University-Grade Lecture Notes & Master Study Guide",
      "readinessScore": "95%",
      "modules": [
        {
          "id": 1,
          "name": "Module Full Title",
          "weight": "35% Exam Weight",
          "lectureContent": "Write comprehensive, rich, multi-paragraph lecture notes here explaining all core concepts, definitions, underlying mechanics, formulas, and historical or logical context in detail.",
          "keyPoints": [
            "Thorough detailed key point 1 with full technical breakdown",
            "Thorough detailed key point 2 with formulas or rules",
            "Thorough detailed key point 3 with architectural or operational logic"
          ],
          "examTraps": "Detailed warning of common pitfalls, misconceptions, and examiner trick questions for this module."
        }
      ],
      "mnemonics": [
        { "term": "Complex Theorem / Process Name", "memory": "Detailed memory hook or mnemonic acronym explanation" }
      ],
      "sampleQuestions": [
        { "q": "Comprehensive multi-part essay or derivation exam question?", "marks": "20 Marks" }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const examNotesData = JSON.parse(response.text);
    return res.json(examNotesData);
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AI & Chat server running on port ${PORT}`);
});

export default app;
