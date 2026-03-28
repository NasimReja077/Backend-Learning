import { Mistral } from "@mistralai/mistralai";
import { documents } from "./data.js";

// Step 1: API key set karo
const client = new Mistral({
  apiKey: "YOUR_API_KEY"
});

// Step 2: Query define karo
const query = "How to improve React performance";

// Step 3: Prompt banate hain (VERY IMPORTANT)
const prompt = `
You are a ranking system.

Query: "${query}"

Documents:
${documents.map((doc, i) => `${i + 1}. ${doc}`).join("\n")}

Task:
Rank the documents based on relevance to the query.

Return only the sorted indices (example: 2,1,3)
`;

// Step 4: LLM call
const response = await client.chat.complete({
  model: "mistral-small",
  messages: [
    { role: "user", content: prompt }
  ]
});

// Step 5: Output print karo
console.log("🤖 LLM Ranking Result:\n");
console.log(response.choices[0].message.content);