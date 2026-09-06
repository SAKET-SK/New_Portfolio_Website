/**
 * /api/chat
 * ---------------------------------------------------------------
 * Serverless function (Vercel Node runtime). Handles one chat turn:
 *   1. Embeds the user's message.
 *   2. Retrieves the most relevant chunks from data/knowledge.json
 *      via cosine similarity (a simple in-memory "vector store" —
 *      no external DB needed at this content scale) combined with
 *      a lightweight keyword-overlap boost (a cheap stand-in for
 *      hybrid dense+sparse retrieval).
 *   3. Calls gpt-5-mini with the retrieved context + short
 *      conversation history, and returns the reply.
 *
 * No npm dependencies — uses Node 18+'s global fetch.
 * Requires the OPENAI_API_KEY environment variable to be set on
 * your hosting provider (Vercel/Netlify project settings).
 * ---------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const CHAT_MODEL = "gpt-5-mini";
const EMBEDDING_MODEL = "text-embedding-3-small";
const TOP_K = 5;
const MAX_HISTORY_TURNS = 10;

const SYSTEM_PROMPT = `You are Saket Khopkar's personal AI assistant, embedded on his portfolio website.
You answer questions about Saket's professional experience, projects, skills, education, and background,
using ONLY the "Context" section provided in each request. If the answer isn't in the context, say you
don't have that information and suggest the visitor use the Contact section to ask Saket directly.
Be warm, concise, and specific — prefer real project names, technologies, and dates from the context over
generic statements. Do not invent facts about Saket that aren't in the context. Keep replies to a few
sentences unless the question calls for a list.`;

let cachedKnowledgeBase = null;

function loadKnowledgeBase() {
  if (cachedKnowledgeBase) return cachedKnowledgeBase;
  const filePath = path.join(process.cwd(), "data", "knowledge.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      "data/knowledge.json not found. Run `npm run build-knowledge` (with OPENAI_API_KEY set) and redeploy."
    );
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedKnowledgeBase = JSON.parse(raw);
  return cachedKnowledgeBase;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Cheap keyword-overlap score, used alongside cosine similarity so exact
// terms (project names, tech names) get a boost even if the embedding
// similarity alone doesn't rank them first — a lightweight stand-in for
// proper hybrid dense + sparse (BM25) retrieval at this content scale.
function keywordScore(query, text) {
  const queryTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
  const lowerText = text.toLowerCase();
  let hits = 0;
  for (const term of queryTerms) {
    if (lowerText.includes(term)) hits += 1;
  }
  return queryTerms.length > 0 ? hits / queryTerms.length : 0;
}

async function embedQuery(apiKey, text) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });

  if (!response.ok) {
    throw new Error(`Embeddings API error: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}

function retrieveContext(queryEmbedding, query, knowledgeBase) {
  const scored = knowledgeBase.map((chunk) => {
    const semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    const lexicalScore = keywordScore(query, chunk.text);
    // Weighted blend: semantic similarity carries most of the weight,
    // keyword overlap nudges exact-term matches (e.g. "RAG", "Accenture") up.
    const combinedScore = semanticScore * 0.8 + lexicalScore * 0.2;
    return { ...chunk, score: combinedScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K);
}

async function generateReply(apiKey, contextChunks, history, userMessage) {
  const contextText = contextChunks
    .map((c) => `[${c.category}] ${c.text}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `Context:\n${contextText}` },
    ...history.slice(-MAX_HISTORY_TURNS),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing OPENAI_API_KEY" });
    return;
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Missing 'message' in request body" });
      return;
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string"
          )
          .slice(-MAX_HISTORY_TURNS)
      : [];

    const knowledgeBase = loadKnowledgeBase();
    const queryEmbedding = await embedQuery(apiKey, message);
    const contextChunks = retrieveContext(queryEmbedding, message, knowledgeBase);
    const reply = await generateReply(apiKey, contextChunks, safeHistory, message);

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    res.status(500).json({ error: "Something went wrong generating a response." });
  }
};