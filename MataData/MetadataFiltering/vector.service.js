export const searchSimilar = (queryEmbedding, filters = {}, topK = 3) => {
  const cosine = (a, b) => {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    return dot / (magA * magB);
  };

  let results = db.map(item => ({
    ...item,
    score: cosine(queryEmbedding, item.embedding),
  }));

  // 🔥 Apply metadata filter
  results = applyFilters(results, filters);

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};