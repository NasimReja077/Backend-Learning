import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export const scrapeContent = async (uri) => {
     const browser = await puppeteer.launch();
     const page = await browser.newPage();

     await page.goto(uri, { waitUntil: "domcontentloaded"});
     const html = await page.content();

     await browser.close();

     const $ = cheerio.load(html);

     const title = $("title").text();
     
     const paragraphs = $("p")
          .map((i, el) => $(el).text())
          .get()
          .join(" ");

  return { title, content: paragraphs.slice(0, 3000) }; // limit content
}