// vectorizer.js
// This file implements a super simple "embedding" model using TF-IDF instead
// of a real neural embedding model (like OpenAI or Voyage embeddings).
//
// Why TF-IDF for a learning project?
// - No API key, no internet call, no dependencies — runs instantly.
// - The MATH is the same idea as real embeddings: turn text into a vector,
//   then compare vectors with cosine similarity to find "similar" text.
// - Once you understand this, swapping in a real embedding API later is
//   just replacing the vectorize() function — the rest of the RAG pipeline
//   (retriever, generator) does not need to change.

// Step 1: Tokenize — turn a string into a list of lowercase words.
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Step 2: Build a vocabulary — the set of all unique words across all documents.
function buildVocabulary(tokenizedDocs) {
  const vocabSet = new Set();
  for (const tokens of tokenizedDocs) {
    for (const token of tokens) vocabSet.add(token);
  }
  return Array.from(vocabSet);
}

// Step 3: Term Frequency — how often each word appears in ONE document,
// normalized by document length.
function termFrequency(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }
  return tf;
}

// Step 4: Inverse Document Frequency — words that appear in MANY documents
// (like "the", "is") get a low score; rare, distinctive words get a high score.
function inverseDocumentFrequency(tokenizedDocs, vocab) {
  const idf = {};
  const totalDocs = tokenizedDocs.length;
  for (const term of vocab) {
    const docsContainingTerm = tokenizedDocs.filter((tokens) =>
      tokens.includes(term)
    ).length;
    idf[term] = Math.log(totalDocs / (1 + docsContainingTerm)) + 1; // +1 smoothing
  }
  return idf;
}

// Step 5: Combine TF and IDF into a single vector for one document,
// using the shared vocabulary so every vector has the same length/order.
function toVector(tf, idf, vocab) {
  return vocab.map((term) => (tf[term] || 0) * (idf[term] || 0));
}

// Public function: takes raw document texts, returns everything needed
// to embed both the documents and future queries consistently.
export function buildVectorSpace(rawTexts) {
  const tokenizedDocs = rawTexts.map(tokenize);
  const vocab = buildVocabulary(tokenizedDocs);
  const idf = inverseDocumentFrequency(tokenizedDocs, vocab);

  const docVectors = tokenizedDocs.map((tokens) => {
    const tf = termFrequency(tokens);
    return toVector(tf, idf, vocab);
  });

  // Given new text (e.g. a user's query), embed it into the SAME vector space.
  function embedText(text) {
    const tokens = tokenize(text);
    const tf = termFrequency(tokens);
    return toVector(tf, idf, vocab);
  }

  return { vocab, docVectors, embedText };
}

// Cosine similarity: measures the angle between two vectors.
// 1 = pointing the same direction (very similar), 0 = unrelated.
export function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
