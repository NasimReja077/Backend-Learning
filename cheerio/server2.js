import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = 3000;

// 🔹 Helper function: extract content
const extractContent = ($) => {
  // Try to get article text
  let content = "";

  $("article p").each((i, el) => {
    content += $(el).text() + "\n";
  });

  // fallback if no article tag
  if (!content) {
    $("p").each((i, el) => {
      content += $(el).text() + "\n";
    });
  }

  return content.trim();
};
// 🔹 API Route
app.get("/extract", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);

    const title = $("title").text();
    const content = extractContent($);

    res.json({
      success: true,
      title,
      content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


//  3