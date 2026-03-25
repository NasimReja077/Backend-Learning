import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();

app.get("/scrape", async (req, res) => {
  const url = req.query.url;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const content = $("p")
      .map((i, el) => $(el).text())
      .get()
      .join("\n");

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running"));