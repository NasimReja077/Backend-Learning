import "dotenv/config";
// ======================
// 1. FILTERING UTILITY
// ======================
const applyFilters = (items, filters = {}) => {
  return items.filter((item) => {
    let valid = true;

    if (filters.dateAfter) {
      valid = valid && new Date(item.metadata.date) > new Date(filters.dateAfter);
    }

    if (filters.tags && filters.tags.length > 0) {
      valid = valid && filters.tags.some((tag) => item.metadata.tags.includes(tag));
    }

    if (filters.source) {
      valid = valid && item.metadata.source === filters.source;
    }

    return valid;
  });
};

// ======================
// 2. DOCUMENT INDEXING
// ======================
export const indexDocument = async (text, customMetadata = {}) => {
  const chunks = await hybridChunk(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    const metadata = {
      date: new Date().toISOString(),
      tags: ["AI", "RAG"],
      source: "user_upload",
      ...customMetadata,
    };

    storeVector(embedding, chunk, metadata);
  }

  console.log(`✅ Indexed ${chunks.length} chunks successfully`);
};

// ======================
// 3. QUESTION ANSWERING (Main RAG)
// ======================
export const askQuestion = async (question, filters = {}) => {
  console.log(`🔍 Asking: "${question}"`);

  const queryEmbedding = await createEmbedding(question);

  const results = searchSimilar(queryEmbedding, filters);

  if (results.length === 0) {
    return "Sorry, I couldn't find any relevant information.";
  }

  const context = results.map((r) => r.text).join("\n\n");

  // Correct Mistral SDK import and usage
  const { Mistral } = await import("@mistralai/mistralai");
  const client = new Mistral({ 
    apiKey: process.env.MISTRAL_API_KEY 
  });

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content: "Answer using ONLY the provided context. If you don't know, say 'I don't know'.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return response.choices[0].message.content;
};

// ======================
// 4. VECTOR SIMILARITY SEARCH
// ======================
export const searchSimilar = (queryEmbedding, filters = {}, topK = 3) => {
  const cosine = (a, b) => {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  };

  let results = db.map((item) => ({
    ...item,
    score: cosine(queryEmbedding, item.embedding),
  }));

  results = applyFilters(results, filters);

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

// ======================
// 5. HELPER FUNCTIONS (Dummy for now)
// ======================
export const hybridChunk = async (text) => {
  const chunkSize = 500;
  const overlap = 50;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

export const createEmbedding = async (text) => {
  console.warn("⚠️ Using dummy embedding (replace with real model later)");
  return new Array(384).fill(0).map(() => Math.random());
};

export let db = [];

export const storeVector = (embedding, text, metadata) => {
  db.push({ embedding, text, metadata });
};

// ======================
// MAIN DEMO FUNCTION
// ======================
const main = async () => {
  console.log("🚀 Starting RAG Demo...\n");

  // 1. Index some sample documents
  await indexDocument("Retrieval-Augmented Generation (RAG) is a technique that improves LLMs by retrieving relevant documents before generating answers.", {
    source: "documentation",
    tags: ["RAG", "AI"]
  });

  await indexDocument("Mistral AI is a French company that provides powerful open and commercial language models.", {
    source: "website",
    tags: ["LLM", "Mistral"]
  });

  // 2. Ask questions with different filters
  console.log("\n📝 Question 1 (No filter):");
  const answer1 = await askQuestion("What is RAG?");
  console.log("Answer:", answer1);

  console.log("\n📝 Question 2 (With tag filter):");
  const answer2 = await askQuestion("Tell me about Mistral AI", { tags: ["Mistral"] });
  console.log("Answer:", answer2);
};

main().catch(console.error);