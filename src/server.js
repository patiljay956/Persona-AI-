// HTTP face for the agent — ready for the shadcn UI to call.
import express from "express";
import cors from "cors";
import { createAgent } from "./agent.js";
import { PORT } from "./config.js";

const app = express();
app.use(cors());
app.use(express.json());

// One agent (conversation) per sessionId, kept in memory.
const sessions = new Map();
const getAgent = (id) => {
  if (!sessions.has(id)) sessions.set(id, createAgent());
  return sessions.get(id);
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// POST /api/chat  { message, sessionId? } -> { text, steps }
app.post("/api/chat", async (req, res) => {
  const { message, sessionId = "default" } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }
  try {
    const { text, steps } = await getAgent(sessionId).ask(message);
    res.json({ text, steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "agent failed", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`🎙️  Persona API on http://localhost:${PORT}`));
