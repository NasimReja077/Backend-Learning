// retriever.js
// This is the "Retrieval" half of RAG. Given a query, it:
//   1. Embeds the query into the same vector space as the documents.
//   2. Compares the query vector against every document vector.
//   3. Returns the top-k most similar documents, sorted by similarity score.

import { buildVectorSpace, cosineSimilarity } from "./vectorizer.js";

export function createRetriever(documents) {
  const texts = documents.map((doc) => doc.text);
  const { docVectors, embedText } = buildVectorSpace(texts);

  function retrieve(query, topK = 3) {
    const queryVector = embedText(query);

    const scored = documents.map((doc, i) => ({
      ...doc,
      score: cosineSimilarity(queryVector, docVectors[i]),
    }));

    // Highest similarity first.
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  return { retrieve };
}
