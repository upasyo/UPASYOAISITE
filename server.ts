import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse json requests
  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route - AI Assistant Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in environment variables. Please check your secrets." 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const systemInstruction = `You are the world-class AI Assistant of UPASYO, an elite AI Scientist and Core Researcher specializing in deep learning, scaling laws, neuro-symbolic reasoning, and cognitive architectures.
      
Your objective is to answer questions about UPASYO's research, publications, projects, blog, achievements, and visions with scientific authority, elegance, and extreme precision.
      
Use the following validated context about UPASYO to ensure 100% accurate, factual answers:
---
${context || "No auxiliary context fetched. Answer proudly based on your pre-trained scientific mind."}
---

Guidelines:
1. Speak with precision, scientific passion, and confidence.
2. Ensure you represent UPASYO's work accurately, avoiding speculation and hallucination. If a detail is missing from the context, gracefully state that you cannot find that specific entry in UPASYO's real-time knowledge base, but offer to explain related research domains or project details.
3. Respond in beautiful, structured markdown, using lists, code keywords, or headers where appropriate to keep it clean.
4. Do not break character. You are UPASYO's personal AI Assistant.`;

      // Build turn contents
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text || "" }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Dev: Vite middleware mounted on Express app.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Prod: Serving compiled static assets from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer();
