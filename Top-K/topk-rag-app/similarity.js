/**
 * COSINE SIMILARITY FUNCTION
 * 
 * This is the core mathematical function used in vector search / semantic search.
 * It measures how similar two vectors (embeddings) are in terms of direction.
 * 
 * Cosine Similarity Score Range:
 *   -  1.0  → Perfectly similar (same direction)
 *   -  0.0  → Completely different (orthogonal)
 *   - -1.0  → Completely opposite
 * 
 * In RAG systems, we usually get scores between 0.2 and 0.95.
 */

export const cosineSimilarity = (vecA, vecB) => {
  
  // Step 1: Handle vectors of different lengths safely
  // We only compare up to the shortest length to avoid errors
  const minLength = Math.min(vecA.length, vecB.length);

  // Initialize variables to store calculations
  let dot = 0;      // Dot product (numerator)
  let magA = 0;     // Magnitude (length) of vector A
  let magB = 0;     // Magnitude (length) of vector B

  // Step 2: Single loop to calculate all three values at once (efficient)
  // We calculate:
  //   • Dot product: sum of (vecA[i] * vecB[i])
  //   • Squared magnitude of vecA
  //   • Squared magnitude of vecB
  for (let i = 0; i < minLength; i++) {
    dot += vecA[i] * vecB[i];           // Accumulate dot product
    magA += vecA[i] * vecA[i];          // Accumulate squared magnitude of A
    magB += vecB[i] * vecB[i];          // Accumulate squared magnitude of B
  }

  // Step 3: Calculate final cosine similarity
  // Formula: cos(θ) = (A · B) / (|A| × |B|)
  // Where:
  //   • A · B     = dot product
  //   • |A| and |B| = Euclidean magnitude (length) of vectors
  
  const magnitudeA = Math.sqrt(magA);   // √(sum of squares of vecA)
  const magnitudeB = Math.sqrt(magB);   // √(sum of squares of vecB)

  // Avoid division by zero (in case one vector is all zeros)
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;   // No similarity if any vector has zero magnitude
  }

  // Final cosine similarity score
  return dot / (magnitudeA * magnitudeB);
};