// utils/extractContent.js
import { load } from "cheerio";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import got from "got";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

async function extractContent(url) {
  const lowerUrl = url.toLowerCase();

  let type = "other";
  let text = "";
  let defaultTitle = "Untitled";
  let metadata = {};

  try {
    // ──────────────────────────────────────────────
    // 1. YouTube
    // ──────────────────────────────────────────────
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      type = "youtube";

      const videoIdMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (!videoId) throw new Error("Invalid YouTube URL");

      // Fetch HTML safely with better headers and error handling
      let html = "";
      try {
        const response = await got(url, {
          timeout: { request: 15000 },
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml"
          },
          retry: { limit: 2 }
        });
        html = response.body || "";
      } catch (fetchErr) {
        console.warn("YouTube page fetch failed:", fetchErr.message);
        html = ""; // fallback
      }

      let $ = null;
      if (html && typeof html === "string" && html.trim().length > 0) {
        $ = load(html);
        defaultTitle = $("title").text().replace(/ - YouTube$/, "").trim() || "YouTube Video";
      } else {
        defaultTitle = "YouTube Video";
      }

      const description = $ ? $('meta[name="description"]').attr("content") || "" : "";

      // Transcript
      let transcriptText = "(Transcript not available)";
      try {
        const { fetchTranscript } = await import("youtube-transcript-plus");
        const transcript = await fetchTranscript(videoId, { lang: "en" });
        transcriptText = transcript.map(entry => entry.text).join(" ").trim();
      } catch (transErr) {
        console.warn(`Transcript unavailable for ${videoId}:`, transErr.message);
      }

      text = `${defaultTitle}\n\n${description}\n\n${transcriptText}`.trim();
      metadata.videoId = videoId;
    }

    // ──────────────────────────────────────────────
    // 2. PDF
    // ──────────────────────────────────────────────
    else if (lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?")) {
      type = "pdf";

      const response = await got(url, {
        responseType: "buffer",
        timeout: { request: 20000 },
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const pdfData = await pdfParse(response.body);
      if (!pdfData.text?.trim()) {
        throw new Error("PDF appears to be empty or unreadable");
      }

      text = pdfData.text.trim();
      defaultTitle = pdfData.info?.Title || "PDF Document";

      if (text.length > 50000) {
        text = text.substring(0, 50000) + "… (truncated)";
      }
      metadata.pageCount = pdfData.numpages;
    }

    // ──────────────────────────────────────────────
    // 3. X / Twitter
    // ──────────────────────────────────────────────
    else if (lowerUrl.includes("x.com") || lowerUrl.includes("twitter.com")) {
      type = "tweet";

      const { data: html } = await got(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: { request: 10000 }
      });
      const $ = load(html);

      text = $('div[data-testid="tweetText"]').first().text().trim() ||
             $("article").text().trim() || "(Could not extract tweet text)";

      defaultTitle = $("title").text()
        .replace(" on X", "")
        .replace(/\/ X$/, "")
        .trim() || "X Post";
    }

    // ──────────────────────────────────────────────
    // 4. Normal Article / Blog (fallback)
    // ──────────────────────────────────────────────
    else {
      type = "article";

      const { data: html } = await got(url, {
        timeout: { request: 15000 },
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      text = article?.textContent?.trim() || "";
      defaultTitle = article?.title || dom.window.document.title || "Article";

      if (text.length < 100) {
        text = dom.window.document.body.innerText.trim().substring(0, 15000);
      }
    }

    return {
      type,
      text: text.substring(0, 30000),
      defaultTitle,
      metadata,
    };

  } catch (err) {
    console.error(`Extract failed for ${url}:`, err.message);
    return {
      type: "other",                    // ← Safe fallback
      text: `Extraction failed: ${err.message}`,
      defaultTitle: "Extraction Failed",
      metadata: { error: err.message },
    };
  }
}

export default extractContent;