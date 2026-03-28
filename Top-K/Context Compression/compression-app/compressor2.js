import { Mistral } from "@mistralai/mistralai";

/**
 * CONTEXT COMPRESSION USING LLM
 * 
 * This function takes retrieved documents and compresses them into
 * a much shorter, high-quality context for the final LLM.
 */
export async function compressContext(query, retrievedDocs, options = {}) {
  
  const { maxTokens = 800, model = "mistral-small-latest" } = options;

  if (retrievedDocs.length === 0) {
    return { compressedContext: "", compressionRatio: 0 };
  }

  // Prepare raw context
  const rawContext = retrievedDocs.map((doc, i) => 
    `Document ${i+1}:\n${doc.text || doc}`
  ).join("\n\n---\n\n");

  const prompt = `
You are an expert context compressor for RAG systems.

Query: "${query}"

Here is the retrieved context:
${rawContext}

Task:
Compress the above context into a concise, informative summary.
- Keep only information relevant to the query.
- Preserve important facts, numbers, and technical details.
- Remove redundancy and irrelevant information.
- Make it as short as possible while keeping it useful for answering the query.
- Use clear and natural language.

Return ONLY the compressed context. Do not add any explanations.
`;

  const client = new Mistral({ 
    apiKey: process.env.MISTRAL_API_KEY 
  });

  const response = await client.chat.complete({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    maxTokens: maxTokens
  });

  const compressedContext = response.choices[0].message.content.trim();

  // Calculate compression ratio
  const originalTokens = Math.ceil(rawContext.length / 4);
  const compressedTokens = Math.ceil(compressedContext.length / 4);
  const compressionRatio = originalTokens > 0 
    ? Math.round(((originalTokens - compressedTokens) / originalTokens) * 100) 
    : 0;

  console.log(`🗜️  Context Compression Applied`);
  console.log(`   Original: ~${originalTokens} tokens`);
  console.log(`   Compressed: ~${compressedTokens} tokens (${compressionRatio}% reduction)`);

  return {
    compressedContext,
    originalTokens,
    compressedTokens,
    compressionRatio
  };
}