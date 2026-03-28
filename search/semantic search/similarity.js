// Compare two vectors using cosine similarity
export const cosineSimilarity = (vecA, vecB) => {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
    dot += vecA[i] * vecB[i];      // dot product
    magA += vecA[i] ** 2;          // magnitude of A
    magB += vecB[i] ** 2;          // magnitude of B
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

/*
WHAT HAPPENS:
- Measures how "similar" two texts are
- Output range: -1 to 1
- Closer to 1 = more similar
*/