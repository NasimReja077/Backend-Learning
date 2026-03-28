import { documents } from "./data.js";
import { getEmbedding } from "./embedding.js";
import { cosineSimilarity } from "./similarity.js";

export const semanticSearch = (query, k = 2) => {
  // Step 1: Convert query → embedding
  const queryEmbedding = getEmbedding(query);

  // Step 2: Compare with each document
  const scoredDocs = documents.map(doc => {
    const docEmbedding = getEmbedding(doc.content);

    const score = cosineSimilarity(queryEmbedding, docEmbedding);

    return { ...doc, score };
  });

  // Step 3: Sort by similarity score (high → low)
  scoredDocs.sort((a, b) => b.score - a.score);

  // Step 4: Return Top-K results
  return scoredDocs.slice(0, k);
};

/*
WHAT HAPPENS:
1. Query → vector
2. Each doc → vector
3. Compare similarity
4. Rank results
5. Return best matches
*/