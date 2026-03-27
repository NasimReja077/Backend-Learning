import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// ✅ SINGLE EMBEDDING
export const embedding = async (text) => {
  const res = await client.embeddings.create({
    model: "mistral-embed",
    inputs: [text.slice(0, 1000)],
  });

  return res.data[0].embedding;
};

// ✅ BATCH EMBEDDING
export const embeddingBatch = async (texts) => {
  const cleanTexts = texts.map((t) => t.slice(0, 1000));

  const res = await client.embeddings.create({
    model: "mistral-embed",
    inputs: cleanTexts,
  });

  return res.data.map((e) => e.embedding);
};

// ✅ SUMMARY
export const summarize = async (text) => {
  const res = await client.chat.complete({
    model: "mistral-small",
    messages: [{ role: "user", content: "Summarize:\n" + text.slice(0, 3000) }],
  });

  return res.choices[0].message.content;
};