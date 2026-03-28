/**
 * EXPRESS SERVER FOR RAG RETRIEVAL API
 * 
 * This file creates a simple REST API that exposes the retrieval functionality.
 * Users can send a POST request with a query and get back the top-K most similar documents.
 */

import express from "express";
import { retrieveTopK } from "./retriever.js";

// Create Express application
const app = express();

// Middleware to parse incoming JSON request bodies
// This allows us to read `req.body` when client sends JSON data
app.use(express.json());

/**
 * POST /search
 * 
 * Endpoint to perform semantic search using vector similarity.
 * 
 * Request Body Example:
 * {
 *   "query": "What is Retrieval Augmented Generation?",
 *   "k": 5
 * }
 * 
 * Response:
 * {
 *   "query": "What is Retrieval Augmented Generation?",
 *   "topK": [ array of top documents with scores ]
 * }
 */
app.post("/search", (req, res) => {
  
  try {
    // Extract query and k from request body
    // 'k' is optional, defaults to 3 if not provided
    const { query, k } = req.body;

    // Basic validation
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Invalid or missing 'query' field. Please provide a string query."
      });
    }

    // Call the retrieval function from retriever.js
    // This performs cosine similarity search and returns top-K results
    const results = retrieveTopK(query, k || 3);

    // Send successful response
    res.status(200).json({
      query: query,
      topK: results,           // Contains documents + their similarity scores
      count: results.length
    });

  } catch (error) {
    console.error("Error in /search endpoint:", error);
    res.status(500).json({
      error: "Internal server error while processing search request."
    });
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("🚀 RAG Retrieval Server is running on http://localhost:3000");
  console.log("   POST /search → Send query to get top similar documents");
});