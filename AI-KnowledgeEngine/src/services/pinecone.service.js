import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// ✅ STORE MULTIPLE VECTORS
export const storeVectors = async (vectors) => {
  const index = pc.index(process.env.PINECONE_INDEX).namespace("default");

  if (!vectors || vectors.length === 0) {
    throw new Error("No vectors to upsert");
  }

  await index.upsert(vectors);

  console.log("✅ Stored", vectors.length, "vectors");
};

// ✅ SEARCH
export const searchVector = async (vector) => {
  const index = pc.index(process.env.PINECONE_INDEX).namespace("default");

  const res = await index.query({
    vector,
    topK: 5,
    includeMetadata: true,
  });

  return res.matches || [];
};