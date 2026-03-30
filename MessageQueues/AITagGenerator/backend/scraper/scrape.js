import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

puppeteer.use(StealthPlugin());

/* -------------------------------
   🥇 Puppeteer (handles JS sites like Medium)
--------------------------------*/
const scrapeWithPuppeteer = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  await page.waitForTimeout(5000); // wait for full load

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  const title = $("title").text();

  const content = $("p")
    .map((i, el) => $(el).text())
    .get()
    .join(" ");

  return {
    title,
    content: content.slice(0, 3000),
  };
};

/* -------------------------------
   🥈 Textise (bypass Medium block)
--------------------------------*/
const scrapeWithTextise = async (url) => {
  const cleanUrl = `https://textise.net/showtext.aspx?strURL=${url}`;

  const { data } = await axios.get(cleanUrl);

  const dom = new JSDOM(data);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return {
    title: article?.title || "No title",
    content: article?.textContent?.slice(0, 3000) || "",
  };
};

/* -------------------------------
   🥉 Readability (simple fallback)
--------------------------------*/
const scrapeWithReadability = async (url) => {
  const { data } = await axios.get(url);

  const dom = new JSDOM(data, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return {
    title: article?.title || "No title",
    content: article?.textContent?.slice(0, 3000) || "",
  };
};

/* -------------------------------
   🎯 MAIN FUNCTION (Smart fallback)
--------------------------------*/
export const scrapeContent = async (url) => {
  try {
    console.log("🚀 Trying Puppeteer...");
    const result = await scrapeWithPuppeteer(url);

    if (result.content && result.content.length > 200) {
      return result;
    }

    throw new Error("Puppeteer content too small");
  } catch (err) {
    console.log("⚠️ Puppeteer failed, trying Textise...");

    try {
      const result = await scrapeWithTextise(url);

      if (result.content && result.content.length > 200) {
        return result;
      }

      throw new Error("Textise failed");
    } catch (err) {
      console.log("⚠️ Textise failed, using Readability...");

      return await scrapeWithReadability(url);
    }
  }
};