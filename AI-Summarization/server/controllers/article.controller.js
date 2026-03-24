import puppeteer from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { summarizeContent } from "../services/ai.service.js";

export const extractArticle = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "Valid URL is required",
      });
    }

    // 🔥 Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    const html = await page.content();
    await browser.close();

    // 🔥 Extract content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return res.status(400).json({
        success: false,
        message: "Could not extract article content",
      });
    }

    // 🧠 AI Summary
    const aiData = await summarizeContent(article.textContent);

    return res.json({
      success: true,
      data: {
        title: article.title,
        byline: article.byline,
        content: article.content,
        textContent: article.textContent,
        ai: aiData,
      },
    });
  } catch (error) {
    console.error("❌ Extract Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};