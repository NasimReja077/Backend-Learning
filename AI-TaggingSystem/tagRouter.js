import express from "express";
import { generateTags } from "./aiTag.js";

const router = express.Router();

// Fake DB
let savedTags = ["react", "javascript"];

router.post("/tag", async (req, res) => {
  const { content } = req.body;

  const tags = await generateTags(content, savedTags);

  // Add new tags to DB (avoid duplicates)
  savedTags = [...new Set([...savedTags, ...tags])];

  res.json({ tags, allTags: savedTags });
});

export default router;