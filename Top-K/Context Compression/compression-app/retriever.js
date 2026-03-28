/**
 * RETRIEVER MODULE
 * Responsible for fetching the most relevant documents using vector similarity (cosine similarity).
 */

import { docs } from "./data.js";
import { getEmbedding } from "./embedding.js";
import { cosineSimilarity } from "./similarity.js";

/**
 * retrieveTopK - Performs semantic search and returns top K most relevant documents
 * 
 * @param {string} query - User's question
 * @param {number} k - Number of top documents to return (default: 2)
 * @returns {Array} Array of documents with added similarity score
 */
export const retrieveTopK = (query, k = 2) => {
  console.log(`🔍 Retrieving top ${k} documents for query: "${query}"`);

  // Step 1: Convert user query into embedding vector
  const qEmb = getEmbedding(query);

  // Step 2: Score every document by calculating cosine similarity with the query
  const scored = docs.map(d => ({
    ...d,                                   // Spread original document (id + content)
    score: cosineSimilarity(qEmb, getEmbedding(d.content))   // Add similarity score
  }));

  // Step 3: Sort documents by score in descending order (highest similarity first)
  // Step 4: Take only the top K documents
  const results = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  console.log(`✅ Retrieved ${results.length} documents`);
  return results;
};