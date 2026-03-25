// Puppeteer: browser open karke JS rendered HTML nikalta hai
import puppeteer from "puppeteer";

// Cheerio: HTML ko parse karke jQuery jaisa access deta hai
// import cheerio from "cheerio";
import * as cheerio from "cheerio";

// JSDOM: browser-like environment create karta hai
import { JSDOM } from "jsdom";

// Readability: article ko clean format me convert karta hai
import { Readability } from "@mozilla/readability";

export const scrapeArticle = async (url) => {
  // 🔵 Puppeteer browser start
  const browser = await puppeteer.launch({ headless: "false" });

  // New tab open
  const page = await browser.newPage();

  // URL load karo
  await page.goto(url, {
    waitUntil: "domcontentloaded", // page load hone ka wait
  });

  // 🟡 Full HTML lo (JS render ke baad)
  const html = await page.content();

  // Browser band karo (important)
  await browser.close();

  // -------------------------------
  // 🟡 Cheerio use (basic extraction)
  // -------------------------------
  const $ = cheerio.load(html);

  // <title> tag se title nikal rahe hain
  const title = $("title").text();

  // -------------------------------
  // 🟢 Readability use (main logic)
  // -------------------------------

  // JSDOM se fake browser environment create
  const dom = new JSDOM(html, { url });

  // Readability ko document pass karte hain
  const reader = new Readability(dom.window.document);

  // Clean article parse karo
  const article = reader.parse();

  // Final data return
  return {
    // Agar readability title nahi deta toh fallback title use karo
    title: article?.title || title,

    // Full clean text
    content: article?.textContent,

    // Short summary
    excerpt: article?.excerpt,

    // Website name
    siteName: article?.siteName,
  };
};