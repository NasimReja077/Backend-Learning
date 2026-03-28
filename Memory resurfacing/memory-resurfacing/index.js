import { memoryStore } from "./memory.js";
import { resurfaceMemory } from "./utils.js";

// 🔹 Step 1: User Query
const query = "How to improve React performance";

// 🔹 Step 2: Memory Resurfacing
const resurfaced = resurfaceMemory(query, memoryStore);

// 🔹 Step 3: Output show karo
console.log("🔁 Resurfaced Memory:\n");

resurfaced.forEach(item => {
  console.log(`Score: ${item.finalScore.toFixed(2)}`);
  console.log(`Text: ${item.text}`);
  console.log("------");
});

// 🔹 Step 4: Final Context (RAG ke liye)
const context = resurfaced.map(item => item.text).join("\n");

console.log("\n🧠 Final Context for LLM:\n");
console.log(context);