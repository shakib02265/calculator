import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Real-time AI Solver functionality will be limited.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Solve system route using Gemini 3.5 Flash
app.post("/api/solve", async (req, res) => {
  try {
    const { problem, mode } = req.body;
    if (!problem) {
      return res.status(400).json({ error: "No mathematical problem or expression provided." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "AI Solver currently offline. Please set your GEMINI_API_KEY in Settings > Secrets to enable real-time calculations.",
        fallback: true
      });
    }

    let userPromptText = `Solve the following engineering/mathematical problem: "${problem}".`;
    if (mode === 'explain') {
      userPromptText = `Explain the mathematical/scientific core, step-by-step proof or physical background of this expression or concept: "${problem}".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPromptText,
      config: {
        systemInstruction: `You are Nexus AI, an extremely precise, professional, and elegant scientific and equation solver assistant embedded within an advanced engineering calculator.
Provide beautiful mathematical breakdowns of equations, engineering problems, physics/chemistry calculations, and conversion questions.
Your explanations should be concisely written in clean Markdown. For any formulas or equations, use robust text or standard single-letter Cartesian formats.
For Cartesian formulas y = f(x), extract graphable equations so that the calculator can plot them on a 2D grid. The equation strings in the 'graphableEqus' array must only contain valid mathematical expressions of 'x' suited for parsing (e.g., "x^2", "sin(x)", "3*x + 2", "Math.sqrt(x)"). Avoid putting 'y =' inside the expressions, just provide the formula details.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "Concise step-by-step mathematical or scientific explanation formatted in readable Markdown."
            },
            calculatedAnswer: {
              type: Type.STRING,
              description: "The finalized numerical result or compact algebraic form of the resolution."
            },
            formulaUsed: {
              type: Type.STRING,
              description: "Key formula(s) applied to solve this prompt."
            },
            graphableEqus: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of expressions in terms of 'x' that can be plotted on a 2D graph, e.g. ['x^2 - 4', 'sin(x)']. Let it be empty if there are no graphable formulas."
            }
          },
          required: ["explanation", "calculatedAnswer", "formulaUsed", "graphableEqus"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response received from AI model.");
    }

    const resData = JSON.parse(outputText.trim());
    return res.json(resData);
  } catch (error: any) {
    console.error("AI Solver Error:", error);
    return res.status(500).json({
      error: "Failed to solve the system. " + (error.message || "Unknown error occurred.")
    });
  }
});

// Setup Vite & static serving
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Nexus Server] running on http://0.0.0.0:${PORT}`);
  });
}

configureServer().catch((err) => {
  console.error("Server boot failure:", err);
});
