// Sample data
const docs = [
  "React useState manages component state",
  "Redux is used for global state management",
  "Semantic search understands meaning",
  "Keyword search matches exact words"
];

// Fake embedding (simple for learning)
const getEmbedding = (text) =>
  text.toLowerCase().split("").map(c => c.charCodeAt(0) / 255);

// Cosine similarity
const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// Keyword score
const keywordScore = (query, doc) => {
  const words = query.toLowerCase().split(" ");
  let score = 0;

  words.forEach(w => {
    if (doc.toLowerCase().includes(w)) score++;
  });

  return score / words.length;
};

// 🔥 Hybrid Search Function
export const hybridSearch = (query) => {
  const queryVec = getEmbedding(query);

  return docs
    .map(doc => {
      // Semantic score
      const sem = cosineSimilarity(queryVec, getEmbedding(doc));

      // Keyword score
      const key = keywordScore(query, doc);

      // Final score (combine)
      const finalScore = 0.5 * sem + 0.5 * key;

      return { doc, sem, key, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
};

/*
FLOW:
1. Query → embedding
2. Compare with all docs (semantic)
3. Check keyword matches
4. Combine scores
5. Sort results
*/