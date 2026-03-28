// ======================
// 1. FILTERING UTILITY
// ======================

/**
 * Applies metadata filters to the retrieved vector search results.
 * This runs AFTER vector similarity search for efficiency.
 */
const applyFilters = (items, filters = {}) => {
  return items.filter((item) => {
    let valid = true;

    // === Date Filter ===
    // Only keep documents newer than the specified date
    if (filters.dateAfter) {
      valid = valid && new Date(item.metadata.date) > new Date(filters.dateAfter);
    }

    // === Tags Filter ===
    // Document must have AT LEAST ONE of the requested tags (OR logic)
    if (filters.tags && filters.tags.length > 0) {
      valid =
        valid &&
        filters.tags.some((tag) => item.metadata.tags.includes(tag));
    }

    // === Source Filter ===
    // Only keep documents from a specific source (e.g., "user_upload", "website", "pdf")
    if (filters.source) {
      valid = valid && item.metadata.source === filters.source;
    }

    return valid;
  });
};

// ======================
// 2. DOCUMENT INDEXING
// ======================

/**
 * Breaks down a large document into smaller chunks, creates embeddings,
 * and stores them in the vector database with metadata.
 */
export const indexDocument = async (text, customMetadata = {}) => {
  // Step 1: Split the text into meaningful chunks using hybrid chunking strategy
  const chunks = await hybridChunk(text);

  for (const chunk of chunks) {
    // Step 2: Convert text chunk into a dense vector (embedding)
    const embedding = await createEmbedding(chunk);

    // Step 3: Prepare metadata (you can override defaults with customMetadata)
    const metadata = {
      date: new Date().toISOString(),        // When this chunk was indexed
      tags: ["AI", "RAG"],                   // Default tags
      source: "user_upload",                 // Where the document came from
      ...customMetadata,                     // Allow user to pass extra metadata
    };

    // Step 4: Store in vector DB (embedding + original text + metadata)
    storeVector(embedding, chunk, metadata);
  }

  console.log(`✅ Indexed ${chunks.length} chunks successfully`);
};

// ======================
// 3. QUESTION ANSWERING (Main RAG Pipeline)
// ======================

/**
 * Main function to ask a question using RAG.
 * It retrieves relevant context using vector search + filters,
 * then sends it to the LLM (Mistral) to generate an answer.
 */
export const askQuestion = async (question, filters = {}) => {
  console.log(`🔍 Asking: "${question}" with filters:`, filters);

  // Step 1: Convert the user's question into an embedding
  const queryEmbedding = await createEmbedding(question);

  // Step 2: Search for similar chunks + apply metadata filters
  const results = searchSimilar(queryEmbedding, filters);

  if (results.length === 0) {
    return "Sorry, I couldn't find any relevant information matching your filters.";
  }

  // Step 3: Combine the retrieved chunks into a single context string
  const context = results.map((r) => r.text).join("\n\n");

  // Step 4: Send context + question to the LLM
  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Answer the question using ONLY the provided context. " +
          "If the answer is not in the context, say you don't know.",
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

/**
 * Performs semantic search using cosine similarity.
 * Then applies metadata filters and returns top-K most relevant results.
 */
export const searchSimilar = (queryEmbedding, filters = {}, topK = 3) => {
  // Cosine similarity function (measures how similar two vectors are)
  const cosine = (a, b) => {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

    // Avoid division by zero
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  };

  // Step 1: Calculate similarity score for every document in the DB
  let results = db.map((item) => ({
    ...item, // spread: text, embedding, metadata
    score: cosine(queryEmbedding, item.embedding),
  }));

  // Step 2: Apply metadata filters (date, tags, source, etc.)
  // 🔥 This is where your filtering logic runs
  results = applyFilters(results, filters);

  // Step 3: Sort by score (highest first) and take topK results
  return results
    .sort((a, b) => b.score - a.score) // descending order
    .slice(0, topK);
};

// ======================
// 5. HELPER / MISSING FUNCTIONS (You need to implement these)
// ======================

// Example placeholder - Replace with your actual chunking logic
export const hybridChunk = async (text) => {
  // TODO: Implement proper chunking (sentence-based + semantic + overlap)
  const chunkSize = 500;
  const overlap = 50;
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Example placeholder - Replace with real embedding model (e.g., OpenAI, HuggingFace, Mistral, etc.)
export const createEmbedding = async (text) => {
  // TODO: Call your embedding API here
  console.warn("⚠️  Using dummy embedding. Replace with real model!");
  return new Array(384).fill(0).map(() => Math.random()); // 384-dim dummy vector
};

// In-memory vector database (Replace with real DB: Pinecone, Weaviate, Chroma, Qdrant, etc.)
export let db = [];

// Store vector + text + metadata
export const storeVector = (embedding, text, metadata) => {
  db.push({
    embedding,
    text,
    metadata,
  });
};

// ======================
// USAGE EXAMPLE
// ======================

/*
async function main() {
  // 1. Index some documents
  await indexDocument("Your long document text here...", {
    source: "pdf",
    tags: ["AI", "RAG", "tutorial"],
  });

  // 2. Ask a question with filters
  const answer = await askQuestion(
    "What is Retrieval Augmented Generation?",
    {
      dateAfter: "2025-01-01",
      tags: ["RAG"],
      source: "pdf",
    }
  );

  console.log("Answer:", answer);
}

main();
*/