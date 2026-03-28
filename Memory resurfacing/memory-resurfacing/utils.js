// 1. Similarity Function
// Query aur memory text ke beech match check karte hain

export function calculateSimilarity(query, text) {
  const qWords = query.toLowerCase().split(" ");
  const tWords = text.toLowerCase().split(" ");

  let score = 0;

  // Har query word check karo
  for (let word of qWords) {
    if (tWords.includes(word)) {
      score += 1; // match mila → score increase
    }
  }

  return score;
}
// 2. Recency Score
// New memory ko boost dena

export function getRecencyScore(timestamp) {
  const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);

  return 1 / (ageInHours + 1);
}
// 3. Tag Matching Score
// Tags ke basis par match

export function tagScore(query, tags) {
  const qWords = query.toLowerCase().split(" ");

  let score = 0;

  for (let tag of tags) {
    if (qWords.includes(tag)) {
      score += 1;
    }
  }

  return score;
}

// 4. Final Resurfacing Function

// 🔥 MAIN LOGIC

export function resurfaceMemory(query, memoryStore) {
  return memoryStore
    .map(item => {

      // Step 1: similarity score
      const sim = calculateSimilarity(query, item.text);

      // Step 2: recency score
      const recency = getRecencyScore(item.timestamp);

      // Step 3: tag score
      const tag = tagScore(query, item.tags);

      // Step 4: usage boost
      const usageBoost = item.usage * 0.1;

      // Step 5: final score
      const finalScore = sim + recency + tag + usageBoost;

      return {
        ...item,
        finalScore
      };
    })
    // Step 6: sort highest first
    .sort((a, b) => b.finalScore - a.finalScore)
    // Step 7: top 2 memory return
    .slice(0, 2);
}