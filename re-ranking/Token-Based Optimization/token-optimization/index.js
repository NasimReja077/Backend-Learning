import { documents } from "./data.js";
import {
  removeDuplicates,
  summarize,
  applyTokenBudget,
  countTokens
} from "./utils.js";

// 🔹 Step 1: User Query
const query = "How to improve React performance";

// 🔹 Step 2: (Simulate Top-K)
// Real me vector DB hota hai
let topKDocs = documents.slice(0, 5);

console.log("📌 Original Docs:\n", topKDocs);

// 🔹 Step 3: Remove duplicates
topKDocs = removeDuplicates(topKDocs);

console.log("\n✅ After Removing Duplicates:\n", topKDocs);

// 🔹 Step 4: Summarize each doc (reduce tokens)
topKDocs = topKDocs.map(doc => summarize(doc, 8));

console.log("\n✂️ After Summarization:\n", topKDocs);

// 🔹 Step 5: Apply Token Budget (max 20 tokens total)
const finalDocs = applyTokenBudget(topKDocs, 20);

console.log("\n🎯 After Token Budget:\n", finalDocs);

// 🔹 Step 6: Final context banate hain
const context = finalDocs.join("\n");

// 🔹 Step 7: Final Prompt
const prompt = `
Answer the query based on context.

Query: ${query}

Context:
${context}
`;

// 🔹 Step 8: Token Count check
console.log("\n🧠 Final Prompt:\n", prompt);
console.log("\n🔢 Total Tokens:", countTokens(prompt));