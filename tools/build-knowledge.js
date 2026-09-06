/**
 * build-knowledge.js
 * ---------------------------------------------------------------
 * Reads data/knowledge-source.json (plain text chunks about Saket),
 * generates an embedding for each chunk using OpenAI's embeddings
 * API, and writes data/knowledge.json — the file /api/chat.js
 * loads at request time to do retrieval.
 *
 * Run this once, and again any time you edit knowledge-source.json
 * (new project, new job, updated skills, etc).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-...  node tools/build-knowledge.js
 *
 * Requires Node 18+ (for global fetch). No npm install needed.
 * ---------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const EMBEDDING_MODEL = "text-embedding-3-small";
const SOURCE_PATH = path.join(__dirname, "..", "data", "knowledge-source.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "knowledge.json");

async function embedText(apiKey, text) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Embeddings API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable is not set.");
    console.error("Usage: OPENAI_API_KEY=sk-... node tools/build-knowledge.js");
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Error: could not find ${SOURCE_PATH}`);
    process.exit(1);
  }

  const chunks = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf-8"));
  console.log(`Loaded ${chunks.length} chunks from knowledge-source.json`);

  const results = [];
  for (const chunk of chunks) {
    process.stdout.write(`Embedding "${chunk.id}"... `);
    const embedding = await embedText(apiKey, chunk.text);
    results.push({ ...chunk, embedding });
    console.log("done");
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results));
  console.log(`\nWrote ${results.length} embedded chunks to ${OUTPUT_PATH}`);
  console.log("Deploy this file alongside your site (or as part of your Vercel deployment).");
}

main().catch((err) => {
  console.error("Failed to build knowledge base:", err.message);
  process.exit(1);
});