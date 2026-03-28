// Ye real cross-encoder nahi hai, but learning ke liye simulation hai

export function crossEncoderScore(query, doc) {

  // Step 1: query ko words me tod do
  const queryWords = query.toLowerCase().split(" ");

  // Step 2: document ko words me tod do
  const docWords = doc.toLowerCase().split(" ");

  let score = 0;

  // Step 3: har query word check karo document me exist karta hai ya nahi
  for (let word of queryWords) {
    if (docWords.includes(word)) {
      score += 1; // match mila → score badhao
    }
  }

  return score; // final relevance score
}