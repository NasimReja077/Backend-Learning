// services/ai.service.js
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// 🔥 Clean Tags
export const improveTags = async (tags) => {
     const prompt = `
     Clean and standardize these tags:
     ${JSON.stringify(tags)}
     
     Rules:
     - remove duplicates
     - proper naming
     - return array only
     - reuse existing tags if possible
     - lowercase
     - max 5 tags
     `;
     
     const res = await client.chat.complete({
          model: "mistral-small",
          messages: [{ 
               role: "user", 
               content: prompt 
          }],
     });

     let output = res.choices[0].message.content.trim();
     // Advanced cleaning: Removes ```json and ``` blocks entirely
    //  const cleanedOutput = output.replace(/^```json/i, "").replace(/```/g, "").trim();
    output = output.replace(/^```(?:json)?\s*/i, "").replace(/```$/gm, "").trim();
    //  return JSON.parse(res.choices[0].message.content);
    try {
        return JSON.parse(output);
    } catch (e) {
        console.error("Failed to parse tags:", output);
        return tags || []; // fallback
    }
};

// / 🔥 Create Embedding
export const createEmbedding = async (text) => {
  const res = await client.embeddings.create({
    model: "mistral-embed",
    input: text,
  });

  return res.data[0].embedding;
}