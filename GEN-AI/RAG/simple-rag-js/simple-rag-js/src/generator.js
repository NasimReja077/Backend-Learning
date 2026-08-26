// generator.js
// This is the "Generation" half of RAG. It takes the user's question plus the
// retrieved chunks and produces a final answer.
//
// Two modes are included so this project runs immediately AND shows how to
// wire up a real LLM later:
//
// 1. offline mode (default, no API key needed): a simple extractive fallback
//    that highlights the most relevant sentence from the retrieved context.
//    This is obviously not "real" generation, but it proves the pipeline
//    (retrieve -> augment -> answer) end to end with zero setup.
//
// 2. LLM mode (optional): if an ANTHROPIC_API_KEY environment variable is
//    set, it calls the real Claude API with the retrieved context as a
//    system prompt, so you can see genuine RAG-grounded generation.

import { tokenize } from "./vectorizer.js";

// Builds the "augmented" prompt: this is the actual RAG trick — stuffing
// retrieved context into the prompt so the model answers using it.
export function buildAugmentedPrompt(query, retrievedChunks) {
  const context = retrievedChunks
    .map((c, i) => `[${i + 1}] (${c.title}) ${c.text}`)
    .join("\n\n");

  return `Answer the question using ONLY the context below. If the context doesn't contain the answer, say so.

Context:
${context}

Question: ${query}

Answer:`;
}

// Offline fallback: naive extractive answer, no API required.
function offlineAnswer(query, retrievedChunks) {
  const queryTerms = new Set(tokenize(query));

  let bestSentence = null;
  let bestScore = -1;
  let bestSource = null;

  for (const chunk of retrievedChunks) {
    const sentences = chunk.text.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const sentenceTerms = tokenize(sentence);
      const overlap = sentenceTerms.filter((t) => queryTerms.has(t)).length;
      if (overlap > bestScore) {
        bestScore = overlap;
        bestSentence = sentence;
        bestSource = chunk.title;
      }
    }
  }

  if (!bestSentence || bestScore === 0) {
    return "I couldn't find a sentence that overlaps with your question in the retrieved context. Try rephrasing, or add more documents to the knowledge base.";
  }

  return `${bestSentence} (based on: "${bestSource}")`;
}

// Real LLM mode, using the Anthropic API directly if a key is available.
async function llmAnswer(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  return textBlock ? textBlock.text : JSON.stringify(data);
}

export async function generateAnswer(query, retrievedChunks) {
  const prompt = buildAugmentedPrompt(query, retrievedChunks);

  if (process.env.ANTHROPIC_API_KEY) {
    return await llmAnswer(prompt);
  }

  return offlineAnswer(query, retrievedChunks);
}
