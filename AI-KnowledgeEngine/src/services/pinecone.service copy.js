import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// ✅ NEW SDK STYLE
export const storeVector = async (id, vector, metadata) => {
  try {
    const indexName = process.env.PINECONE_INDEX;

    console.log("Using index:", indexName);

    // ✅ IMPORTANT: use namespace()
    const index = pc.index(indexName).namespace("default");

    // ✅ VECTOR FORMAT
    const vectors = [
      {
        id: id.toString(),
        values: vector,
        metadata: metadata || {},
      },
    ];

    console.log("Vectors:", vectors.length);

    // ❗ FINAL FIX: pass DIRECTLY (NOT inside { vectors: ... })
    await index.upsert(vectors);

    console.log("✅ Pinecone success");

  } catch (error) {
    console.error("❌ Pinecone error:", error.message);
    throw error;
  }
};

// ✅ SEARCH VECTOR (ADD THIS)
export const searchVector = async (vector) => {
  try {
    const indexName = process.env.PINECONE_INDEX;

    const index = pc.index(indexName).namespace("default");

    const res = await index.query({
      vector: vector,
      topK: 5,
      includeMetadata: true,
    });

    return res.matches || [];

  } catch (error) {
    console.error("❌ Search error:", error.message);
    throw error;
  }
};