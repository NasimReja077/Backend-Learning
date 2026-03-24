import express from "express";
import { extractArticle } from "../controllers/article.controller.js";

const router = express.Router();

// 🔹 POST → Extract + AI Summary
router.post("/extract", extractArticle);

export default router;