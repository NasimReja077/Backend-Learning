// 🔹 Token count function (approximation)
// Har word ko ek token maan rahe hain (real me alag hota hai)

export function countTokens(text) {
  return text.split(" ").length;
}

// 🔹 Step 1: Remove duplicate documents

export function removeDuplicates(docs) {
  const unique = new Set();

  return docs.filter(doc => {
    if (unique.has(doc)) return false; // already seen → remove
    unique.add(doc);
    return true;
  });
}


// 🔹 Step 2: Truncate text (limit tokens)

export function truncateText(text, maxTokens) {
  const words = text.split(" ");

  return words.slice(0, maxTokens).join(" ");
}


// 🔹 Step 3: Simple summarization (first N words)

export function summarize(text, maxTokens) {
  return truncateText(text, maxTokens);
}


// 🔹 Step 4: Token Budget Control

export function applyTokenBudget(docs, maxTotalTokens) {
  let total = 0;
  const result = [];

  for (let doc of docs) {
    const tokens = countTokens(doc);

    // Agar add karne se limit exceed ho rahi hai → stop
    if (total + tokens > maxTotalTokens) break;

    result.push(doc);
    total += tokens;
  }

  return result;
}