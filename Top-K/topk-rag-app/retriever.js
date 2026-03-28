/**
 * RETRIEVAL FUNCTION - Core of the Retrieval Pipeline
 * 
 * This function takes a user query and returns the top K most relevant 
 * documents using semantic (vector) similarity.
 * 
 * It is a simplified but complete example of the Retrieval stage in RAG.
 */

import { documents } from "./data.js";
import { getEmbedding } from "./embedding.js";
import { cosineSimilarity } from "./similarity.js";

export const retrieveTopK = (query, k = 3) => {
  
  console.log(`🔍 Retrieving top ${k} documents for query: "${query}"`);

  // Step 1: Convert the user's question into a vector (embedding)
  // This allows us to compare the "meaning" of the query with our documents
  const queryEmbedding = getEmbedding(query);

  // Step 2: Score every document in our collection
  // We loop through all documents and calculate how similar each one is to the query
  const scoredDocs = documents.map(doc => {
    
    // 2a: Get the embedding (vector) of the current document
    // Note: In a real system, we usually pre-compute and store embeddings 
    // to avoid calculating them every time (this is inefficient here)
    const docEmbedding = getEmbedding(doc.content);

    // 2b: Calculate similarity between query vector and document vector
    // Higher score = more semantically similar
    const score = cosineSimilarity(queryEmbedding, docEmbedding);

    // Return the original document + the new similarity score
    return { 
      ...doc,      // Spread: includes id, content, metadata, etc.
      score        // Add the calculated similarity score
    };
  });

  // Step 3: Sort documents by similarity score in descending order
  // (Best matching documents come first)
  scoredDocs.sort((a, b) => b.score - a.score);

  // Step 4: Return only the top K most relevant documents
  // Example: If k=3, we return only the 3 best matches
  const topResults = scoredDocs.slice(0, k);

  console.log(`✅ Retrieved ${topResults.length} documents (Top-${k})`);
  
  return topResults;
};
