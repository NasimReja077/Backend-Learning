import { Mistral } from "@mistralai/mistralai";
import { documents } from "./data.js";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY   // Better to use env variable
});

const query = "How to improve React performance";

/**
 * LLM-based Re-ranker
 */
async function rankDocumentsWithLLM(query, docs) {
  const prompt = `
You are an expert document ranking system.

Query: "${query}"

Here are the documents to rank:
${docs.map((doc, i) => `${i + 1}. ${doc}`).join("\n")}

Instructions:
- Rank the documents from most relevant to least relevant.
- Return ONLY the indices in sorted order, separated by commas.
- Example output: 2,1,3
- Do not add any explanation or extra text.
`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",     // Use latest small model
    messages: [{ role: "user", content: prompt }],
    temperature: 0.0,                  // Low temperature for consistent output
    maxTokens: 50
  });

  const output = response.choices[0].message.content.trim();

  // Parse the output like "2,1,3" into array [2,1,3]
  const indices = output.split(",").map(n => parseInt(n.trim()) - 1); // convert to 0-based

  // Create ranked documents
  const rankedDocs = indices.map(index => docs[index]);

  console.log("🤖 LLM Re-ranking Result:");
  console.log("Ranking order (indices):", indices);
  console.log("Ranked Documents:");
  rankedDocs.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc}`);
  });

  return rankedDocs;
}

// Run the function
rankDocumentsWithLLM(query, documents).catch(console.error);