import puppeteer from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const extractArticle = async (req, res) => {
  try {
    const { url } = req.body;

    const browser = await puppeteer.launch({
      headless: "new",
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    const html = await page.content();

    await browser.close();

    const dom = new JSDOM(html, { url });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    res.json({ success: true, data: article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};











// import axios from "axios";
// import { JSDOM } from "jsdom";
// import { Readability } from "@mozilla/readability";

// export const extractArticle = async (req, res) => {
//   try {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ message: "URL is required" });
//     }

//     // ✅ ADVANCED HEADERS (IMPORTANT FIX)
//     const response = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
//         Accept:
//           "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//         "Accept-Language": "en-US,en;q=0.5",
//         Connection: "keep-alive",
//       },
//     });

//     const dom = new JSDOM(response.data, { url });

//     const reader = new Readability(dom.window.document);
//     const article = reader.parse();

//     if (!article) {
//       return res.status(400).json({
//         message: "❌ Could not extract article",
//       });
//     }

//     res.json({
//       success: true,
//       data: article,
//     });
//   } catch (error) {
//     console.error("🔥 ERROR FULL:", error.response?.status, error.message);

//     res.status(500).json({
//       success: false,
//       message:
//         error.response?.status === 403
//           ? "❌ Website blocked request (try another URL)"
//           : error.message,
//     });
//   }
// };

