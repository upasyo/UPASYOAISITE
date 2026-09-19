import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable strong ETags for efficient 304 Not Modified conditional cache revalidation
  app.set("etag", "strong");

  // Middleware to parse json requests
  app.use(express.json());

  // Set appropriate cache lifetimes for API endpoints
  app.use("/api", (req, res, next) => {
    if (req.path === "/health" && req.method === "GET") {
      // Health check endpoint: short efficient cache lifetime with background revalidation
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    } else {
      // Dynamic mutating endpoints (chat, inquiry submission): real-time, no-store
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route - Record Inbound Contact Inquiries with Date for Spreadsheet Tracking
  app.post("/api/record-inquiry", async (req, res) => {
    try {
      const { name, email, subject, message, date, formattedDate, formattedTime, timestamp, spreadsheetWebhookUrl } = req.body;
      const submissionDate = date || new Date().toISOString().split("T")[0];
      const submissionTime = formattedTime || new Date().toLocaleTimeString();
      const submissionTimestamp = timestamp || new Date().toISOString();

      console.log(`[Form Inbound Recorded] Date: ${submissionDate} ${submissionTime} | Name: ${name} | Email: ${email} | Subject: ${subject}`);

      // Forward to Google Apps Script / Spreadsheet Webhook if specified
      const webhook = spreadsheetWebhookUrl || process.env.SPREADSHEET_WEBHOOK_URL;
      if (webhook && typeof webhook === "string" && webhook.startsWith("http")) {
        try {
          const webhookResp = await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: submissionDate,
              time: submissionTime,
              timestamp: submissionTimestamp,
              name: name || "Anonymous",
              email: email || "No email",
              subject: subject || "Inquiry",
              message: message || ""
            })
          });
          console.log(`[Spreadsheet Webhook Dispatched] Target: ${webhook} | Status: ${webhookResp.status}`);
        } catch (webhookErr) {
          console.warn("[Spreadsheet Webhook Dispatch Warning]:", webhookErr);
        }
      }

      res.json({ 
        success: true, 
        message: "Form inquiry and date logged for spreadsheet successfully", 
        date: submissionDate,
        time: submissionTime,
        timestamp: submissionTimestamp 
      });
    } catch (err: any) {
      console.error("Error in /api/record-inquiry:", err);
      res.status(500).json({ error: err.message || "Failed to record inquiry" });
    }
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
    
    // Serve static assets with fine-grained, efficient cache lifetimes (Lighthouse & Core Web Vitals standard)
    app.use(express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/").toLowerCase();
        
        // 1. HTML entrypoint: must be revalidated each time to guarantee instant deployment updates
        // With strong ETags, unchanged visits receive a 304 Not Modified instantly without data payload
        if (normalized.endsWith(".html") || normalized.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, must-revalidate, max-age=0");
          return;
        }

        // 2. Vite-fingerprinted hashed assets (JavaScript, CSS, Wasm bundles):
        // File content hash is baked into the filename (e.g. index-B39f0a.js), making them 100% immutable
        if (normalized.includes("/assets/") || /-[a-f0-9]{8,}\.(js|css|wasm)$/i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        // 3. Web fonts: immutable across versions
        if (/\.(woff2?|ttf|otf|eot)$/i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        // 4. Static media, images, and graphics: 30 days cache with 1 day stale-while-revalidate
        if (/\.(png|jpe?g|webp|svg|gif|ico|avif|mp3|mp4|webm)$/i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400");
          return;
        }

        // 5. App manifests, robots, sitemaps: 1 day cache with 1 hour stale-while-revalidate
        if (/\.(webmanifest|json|txt|xml)$/i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
          return;
        }

        // 6. Generic fallback: 1 day with validation
        res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
      }
    }));

    app.get("*", (req, res) => {
      // Revalidate HTML entry point with ETags for zero-overhead 304 responses on unchanged builds
      res.setHeader("Cache-Control", "no-cache, must-revalidate, max-age=0");
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Prod: Serving compiled static assets with optimized, efficient cache lifetimes.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer();
