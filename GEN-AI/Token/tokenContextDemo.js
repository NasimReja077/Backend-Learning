import { encode, countTokens } from 'gpt-tokenizer';

/**
 * Count tokens for a given text
 * Uses o200k_base encoding (GPT-4o, GPT-4.1, GPT-5 series, etc.)
 */
function getTokenCount(text) {
  return countTokens(text);          // fastest way
  // or: return encode(text).length;
}

/**
 * Simulate context window usage
 */
function simulateContextUsage(prompt, maxContext = 128_000) {
  const tokens = getTokenCount(prompt);
  const remaining = maxContext - tokens;
  const usagePct = (tokens / maxContext) * 100;

  console.log("=== Token & Context Simulator ===\n");
  console.log(`Text length      : ${prompt.length.toLocaleString()} characters`);
  console.log(`Token count      : ${tokens.toLocaleString()} tokens`);
  console.log(`Context window   : ${maxContext.toLocaleString()} tokens`);
  console.log(`Used             : ${usagePct.toFixed(2)}%`);
  console.log(`Remaining        : ${remaining.toLocaleString()} tokens`);

  if (tokens > maxContext) {
    console.log("\n⚠️  WARNING: Exceeds context window! Model will truncate or reject.");
  } else if (usagePct > 80) {
    console.log("\n⚠️  High usage — leave room for the model's response.");
  } else {
    console.log("\n✅ Comfortable margin left for generation.");
  }
}

// ========== DEMO ==========
const sampleText = `
This is a long document about Large Language Models.
Tokens are the basic units that LLMs understand.
Context window is the maximum number of tokens the model can process at once.
Inference is the process of generating text using a trained model.
`.repeat(10);   // make it longer for testing

// Run with different context sizes
simulateContextUsage(sampleText, 128_000);   // old typical size
// simulateContextUsage(sampleText, 200_000);
// simulateContextUsage(sampleText, 1_000_000);  // modern 1M models