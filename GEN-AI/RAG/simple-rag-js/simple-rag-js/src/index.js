// index.js
// Run this file to see the full RAG pipeline step by step:
//   node src/index.js "your question here"
//
// Pipeline: Query -> Retrieve top-k chunks -> Augment prompt -> Generate answer

import { documents } from "./documents.js";
import { createRetriever } from "./retriever.js";
import { generateAnswer, buildAugmentedPrompt } from "./generator.js";

async function main() {
  const query = process.argv.slice(2).join(" ") || "What is a stack used for?";

  console.log("=".repeat(60));
  console.log("STEP 0: The question");
  console.log("=".repeat(60));
  console.log(query);

  const { retrieve } = createRetriever(documents);
  const topK = 3;
  const retrieved = retrieve(query, topK);

  console.log("\n" + "=".repeat(60));
  console.log(`STEP 1: Retrieval (top ${topK} chunks by cosine similarity)`);
  console.log("=".repeat(60));
  retrieved.forEach((chunk, i) => {
    console.log(`${i + 1}. [score ${chunk.score.toFixed(3)}] ${chunk.title}`);
    console.log(`   ${chunk.text.slice(0, 90)}...`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Augmentation (prompt sent to the generator)");
  console.log("=".repeat(60));
  console.log(buildAugmentedPrompt(query, retrieved));

  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Generation (final answer)");
  console.log("=".repeat(60));
  const answer = await generateAnswer(query, retrieved);
  console.log(answer);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "\n(Running in offline mode — set ANTHROPIC_API_KEY to see a real LLM generate this answer instead.)"
    );
  }
}

main();
