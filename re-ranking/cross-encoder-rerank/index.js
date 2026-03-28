import { documents } from "./data.js";
import { crossEncoderScore } from "./similarity.js";

// Step 1: User query
const query = "React performance improve";

// Step 2: Har document ke liye score calculate karo
const scoredDocs = documents.map(doc => {

  const score = crossEncoderScore(query, doc.text);

  return {
    ...doc,
    score // score add kar diya
  };
});

// Step 3: Sort descending (highest score first)
const reranked = scoredDocs.sort((a, b) => b.score - a.score);

// Step 4: Top results show karo
console.log("🔝 Re-ranked Results:\n");

reranked.forEach(doc => {
  console.log(`Score: ${doc.score} → ${doc.text}`);
});