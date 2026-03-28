// Convert text → vector (embedding)
export const getEmbedding = (text) => {
  // Step: convert each character to a number
  return text
    .toLowerCase()
    .split("")
    .map(char => char.charCodeAt(0) / 255);
};

/*
WHAT HAPPENS:
- "AI" → ['a','i']
- → [97,105] → normalized → [0.38, 0.41]
- This creates a numeric representation of text
*/