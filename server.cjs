var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.");
}
var ai = new import_genai.GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.post("/api/gemini/summary", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this educational content and provide a structured summary including: Key Points, Important Concepts, Easy Explanation, and Exam Prep Notes. Output in Markdown format. 

 Content: ${text}`
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Error in /api/gemini/summary:", error);
      res.status(500).json({ error: error.message || "Error generating summary" });
    }
  });
  app.post("/api/gemini/multimodal", async (req, res) => {
    try {
      const { fileData } = req.body;
      if (!fileData || !fileData.data || !fileData.mimeType) {
        return res.status(400).json({ error: "fileData with data and mimeType is required" });
      }
      const isPdf = fileData.mimeType === "application/pdf" || fileData.mimeType.includes("pdf");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data
            }
          },
          {
            text: `You are an expert AI learning assistant. Analyze the uploaded ${isPdf ? "document" : "image"} (containing textbook pages, handwritten notes, educational material, or study guide).
Extract all the key content and produce a beautifully formatted structured study page with:
1. **Overview & Context** (1-2 sentences introduction)
2. **Key Concepts Explained** (Explain 3-4 major definitions, terms, or processes with neat formatting)
3. **Important Summary Points** / **Exam Prep Notes** (Actionable, scannable study bullets)
4. **Simple Analogy** (An intuitive real-life analogy explaining the core lesson concept)

Ensure the output is written in standard, clear Markdown with cohesive headings. If there are code blocks, equations, or diagrams described, represent them cleanly.`
          }
        ]
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Error in /api/gemini/multimodal:", error);
      res.status(500).json({ error: error.message || "Error generating multimodal summary" });
    }
  });
  app.post("/api/gemini/quiz", async (req, res) => {
    try {
      const { text, count = 5 } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a quiz with ${count} multiple-choice questions based on this content. Include the correct answer and a brief explanation for each. 

 Content: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                question: { type: import_genai.Type.STRING },
                options: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                correctAnswer: { type: import_genai.Type.STRING },
                explanation: { type: import_genai.Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      res.json({ result: JSON.parse(response.text || "[]") });
    } catch (error) {
      console.error("Error in /api/gemini/quiz:", error);
      res.status(500).json({ error: error.message || "Error generating quiz" });
    }
  });
  app.post("/api/gemini/flashcards", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 5 flashcards for this content. Each flashcard should have a 'front' (question/term) and a 'back' (answer/definition). 

 Content: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                front: { type: import_genai.Type.STRING },
                back: { type: import_genai.Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        }
      });
      res.json({ result: JSON.parse(response.text || "[]") });
    } catch (error) {
      console.error("Error in /api/gemini/flashcards:", error);
      res.status(500).json({ error: error.message || "Error generating flashcards" });
    }
  });
  app.post("/api/gemini/topics", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract a list of the most important topics and learning objectives from this educational content. Provide a bulleted list with brief descriptions for each. Output in Markdown format. 

 Content: ${text}`
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Error in /api/gemini/topics:", error);
      res.status(500).json({ error: error.message || "Error generating topics" });
    }
  });
  app.post("/api/gemini/explanation", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Explain this content in very simple terms, as if you were explaining it to a young student. Use analogies and avoid complex jargon. Output in Markdown format. 

 Content: ${text}`
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Error in /api/gemini/explanation:", error);
      res.status(500).json({ error: error.message || "Error generating explanation" });
    }
  });
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...history.map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "You are SmartStudy AI, a helpful and patient tutor for students in classes 6-10. Explain complex topics simply using conceptual breakdowns and vivid analogies suitable for middle & high school students. Always encourage the student."
        }
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Error in /api/gemini/chat:", error);
      res.status(500).json({ error: error.message || "Error in chatWithTutor" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
