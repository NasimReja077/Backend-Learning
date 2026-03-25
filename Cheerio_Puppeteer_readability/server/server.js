import express from "express";
import cors from "cors";
import { scrapeArticle } from "./scraper.js";

const app = express();

// CORS enable (frontend connect kar sake)
app.use(cors());

// JSON data accept kare
app.use(express.json());

// API route
app.post("/extract", async (req, res) => {
  try {
    // frontend se URL aa raha hai
    const { url } = req.body;

    // scraping function call
    const data = await scrapeArticle(url);

    // success response
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    // error handle
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// server start
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});