import Content from "../models/content.model.js";
import { extractArticle } from "../services/article.service.js";
import { embeddingBatch, summarize } from "../services/ai.service.js";
import { storeVectors } from "../services/pinecone.service.js";
import { splitText } from "../utils/chunk.js";

export const addFromURL = async (req, res) => {
  try {
    const { url } = req.body;

    const { title, content } = await extractArticle(url);

    console.log("Content length:", content.length);

    // ✅ CHUNKING
    const chunks = splitText(content, 500, 100);
    console.log("Chunks:", chunks.length);

    // ✅ EMBEDDINGS
    const embeddings = await embeddingBatch(chunks);

    // ✅ PREPARE VECTORS
    const vectors = embeddings.map((vec, i) => ({
      id: `${Date.now()}-${i}`,
      values: vec,
      metadata: {
        text: chunks[i],
        title,
      },
    }));

    // ✅ STORE IN PINECONE
    await storeVectors(vectors);

    // ✅ SAVE DB
    const summary = await summarize(content);

    const saved = await Content.create({
      title,
      content,
      summary,
    });

    res.json({
      success: true,
      chunks: chunks.length,
      data: saved,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};