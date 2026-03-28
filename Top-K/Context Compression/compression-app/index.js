/**
 * RAG SERVER WITH RETRIEVAL + CONTEXT COMPRESSION
 * 
 * This API demonstrates a basic RAG flow:
 * 1. Retrieve relevant documents using vector search
 * 2. Compress the context to reduce token usage
 * 3. Return compressed context (ready to be sent to LLM)
 */

import express from "express";
import { retrieveTopK } from "./retriever.js";
import { compressContext } from "./compressor.js";

const app = express();
app.use(express.json());   // Middleware to parse JSON request body

/**
 * POST /ask
 * Main endpoint for RAG query
 * 
 * Request Body:
 * {
 *   "query": "What is RAG?"
 * }
 */
app.post("/ask", (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required and must be a string" });
    }

    console.log("\n" + "=".repeat(70));
    console.log(`📥 New Request: "${query}"`);

    // Step 1: Retrieval Stage - Get top relevant documents using cosine similarity
    const retrievedDocs = retrieveTopK(query, 2);

    // Step 2: Compression Stage - Reduce context size by keeping only relevant sentences
    const compressedContext = compressContext(retrievedDocs, query);

    // Final Response
    res.status(200).json({
      success: true,
      query: query,
      retrievedCount: retrievedDocs.length,
      compressedContext: compressedContext,
      note: "This compressed context can now be sent to LLM for final answer generation"
    });

  } catch (error) {
    console.error("Error in /ask endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("🚀 RAG Server with Context Compression is running");
  console.log("   Endpoint: POST http://localhost:3000/ask");
});