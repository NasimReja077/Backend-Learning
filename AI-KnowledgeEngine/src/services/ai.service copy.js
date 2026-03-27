
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// ✅ TAG GENERATION
export const generateTags = async (text) => {
  const prompt = `
Generate clean tags.

Text: ${text}

Rules:
- Return JSON array only
- Max 5 tags
- lowercase
`;

  try {
    const res = await client.chat.complete({
      model: "mistral-small",
      messages: [{ role: "user", content: prompt }],
    });

    let output = res.choices[0].message.content.trim();

    output = output.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    const tags = JSON.parse(output);

    return Array.isArray(tags) ? tags.slice(0, 5) : [];
  } catch {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 5);
  }
};

// ✅ SUMMARY
export const summarize = async (text) => {
  const res = await client.chat.complete({
    model: "mistral-small",
    messages: [{ role: "user", content: "Summarize:\n" + text.slice(0, 5000) }],
  });

  return res.choices[0].message.content;
};

// ✅ EMBEDDING (FINAL FIXED)
export const embedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for embedding");
  }

  const cleanText = text.trim().slice(0, 8000);

  console.log("Embedding input length:", cleanText.length);

  const res = await client.embeddings.create({
    model: "mistral-embed",
    inputs: [cleanText], // ✅ IMPORTANT FIX
  });

  const vector = res?.data?.[0]?.embedding;

  if (!vector || !Array.isArray(vector) || vector.length === 0) {
    console.error("Embedding failed response:", res);
    throw new Error("Embedding failed");
  }

  return vector;
};