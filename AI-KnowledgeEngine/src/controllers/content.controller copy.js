import Content from "../models/content.model.js";
import { extractArticle } from "../services/article.service.js";
import { generateTags, summarize, embedding } from "../services/ai.service.js";
import { storeVector } from "../services/pinecone.service.js";

export const addFromURL = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: "URL required" });

    console.log("Processing URL:", url);

    const { title, content } = await extractArticle(url);

    console.log("Content length:", content.length);

    const tags = await generateTags(content);
    const summary = await summarize(content);

    const vector = await embedding(content);

    console.log("Vector length:", vector.length);

    const saved = await Content.create({
      title,
      content,
      tags,
      summary,
    });

    await storeVector(saved._id.toString(), vector, {
      title,
      summary,
    });

    res.json({ success: true, data: saved });
  } catch (error) {
    console.error("addFromURL failed:", error.message);
    res.status(500).json({ error: error.message });
  }
};