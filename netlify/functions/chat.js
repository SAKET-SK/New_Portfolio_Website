/**
 * netlify/functions/chat.js
 * ---------------------------------------------------------------
 * Netlify Functions version of the chat backend. Same retrieval +
 * generation logic as the Vercel version in /api/chat.js, adapted
 * to Netlify's (event, context) => response handler signature.
 *
 * Reachable at /.netlify/functions/chat by default; netlify.toml
 * adds a redirect so the frontend can keep calling /api/chat
 * (no change needed in scripts/script.js).
 *
 * Requires the OPENAI_API_KEY environment variable to be set in
 * Netlify: Site settings → Environment variables.
 * ---------------------------------------------------------------
 */

// Bundled at build time by Netlify's function bundler (esbuild) —
// no filesystem path juggling needed at runtime.
const knowledgeBase = require("../../data/knowledge.json");

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

function retrieveContext(queryEmbedding, query) {
  const scored = knowledgeBase.map((chunk) => {
    const semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    const lexicalScore = keywordScore(query, chunk.text);
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
      // gpt-5-mini is a reasoning-style model: part of this budget can be
      // spent on internal reasoning before any visible text is written,
      // so this needs headroom beyond just "how long should the reply be".
      max_completion_tokens: 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  if (!content || !content.trim()) {
    // Surface the raw response in logs so an empty reply is diagnosable
    // (e.g. hit the token cap during reasoning, got filtered, etc.)
    console.error("Empty completion content. Full response:", JSON.stringify(data));
    throw new Error("Model returned an empty response.");
  }

  return content.trim();
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing OPENAI_API_KEY" }),
    };
  }

  try {
    const parsedBody = JSON.parse(event.body || "{}");
    const { message, history } = parsedBody;

    if (!message || typeof message !== "string" || !message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'message' in request body" }),
      };
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

    const queryEmbedding = await embedQuery(apiKey, message);
    const contextChunks = retrieveContext(queryEmbedding, message);
    const reply = await generateReply(apiKey, contextChunks, safeHistory, message);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Chat handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong generating a response." }),
    };
  }
};