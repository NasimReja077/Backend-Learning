import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const OUTPUT_DIR = "./output";

// List of articles you want to scrape (add as many as you want)
const ARTICLE_URLS = [
  // Add more URLs here,
  "https://medium.com/@techsuneel99/a-beginners-guide-to-cdn-what-it-is-and-how-it-works-b6e1c1f5dda4",
  "https://medium.com/@techsuneel99/docker-from-beginner-to-expert-a-comprehensive-tutorial-5efec10c82ab"
];

async function autoScroll(page) {
  console.log("   ↕️  Auto-scrolling to load full article...");
  await page.evaluate(async () => {
    let lastHeight = 0;
    while (true) {
      window.scrollBy(0, window.innerHeight);
      await new Promise((resolve) => setTimeout(resolve, 800)); // human-like delay
      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }
  });
}

async function scrapeAndExport(url) {
  let browser;
  try {
    console.log(`\n🚀 Processing: ${url}`);

    browser = await puppeteer.launch({
      headless: false, // set to true when done testing
      defaultViewport: { width: 1366, height: 768 },
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector("article", { timeout: 15000 });
    await autoScroll(page); // ← Important for full content

    // Extract data + convert to Markdown-friendly format
    const article = await page.evaluate(() => {
      const art = document.querySelector("article");
      if (!art) return null;

      const title =
        document.querySelector("h1")?.innerText.trim() || "Untitled";
      const author =
        document.querySelector('a[href*="/@"]')?.innerText.trim() ||
        "Unknown Author";

      // // Build Markdown content
      let markdown = `# ${title}\n\n`;
      markdown += `**By:** ${author}\n\n`;

      const elements = art.querySelectorAll("h1, h2, h3, h4, p, li, pre, blockquote, img");

      elements.forEach(el => {
          const tag = el.tagName.toLowerCase();
          const text = el.innerText.trim();

          if (tag === "h1") markdown += `# ${text}\n\n`;
          else if (tag === "h2") markdown += `## ${text}\n\n`;
          else if (tag === "h3") markdown += `### ${text}\n\n`;
          else if (tag === "p") markdown += `${text}\n\n`;
          else if (tag === "li") markdown += `- ${text}\n`;
          else if (tag === "pre") markdown += `\`\`\`\n${text}\n\`\`\`\n\n`;
          else if (tag === "blockquote") markdown += `> ${text}\n\n`;
          // You can add image support later if needed
      });

      return { title, author, markdown };

      // Replace the old forEach block with this improved version:

    //   let markdown = `# ${title}\n\n`;
    //   markdown += `**Author:** ${author}\n\n`;

    //   const elements = art.querySelectorAll(
    //     "h1, h2, h3, h4, p, ul, ol, pre, blockquote",
    //   );

    //   elements.forEach((el) => {
    //     const tag = el.tagName.toLowerCase();
    //     const text = el.innerText.trim();

    //     if (!text) return;

    //     if (tag.startsWith("h")) {
    //       const level = parseInt(tag[1]);
    //       markdown += `${"#".repeat(level)} ${text}\n\n`;
    //     } else if (tag === "p") {
    //       markdown += `${text}\n\n`;
    //     } else if (tag === "ul" || tag === "ol") {
    //       const items = el.querySelectorAll("li");
    //       items.forEach((li) => {
    //         const liText = li.innerText.trim();
    //         markdown += `- ${liText}\n`;
    //       });
    //       markdown += "\n";
    //     } else if (tag === "pre") {
    //       markdown += `\`\`\`\n${text}\n\`\`\`\n\n`;
    //     } else if (tag === "blockquote") {
    //       markdown += `> ${text.replace(/\n/g, "\n> ")}\n\n`;
    //     }
    //   });
    });

    if (!article) throw new Error("Failed to extract article");

    // Create folder for this article
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 50);
    const articleDir = path.join(OUTPUT_DIR, slug);
    await fs.mkdir(articleDir, { recursive: true });

    // Save Markdown
    const mdPath = path.join(articleDir, `${slug}.md`);
    await fs.writeFile(mdPath, article.markdown);
    console.log(`   ✅ Markdown saved → ${mdPath}`);

    // Save PDF (high quality)
    const pdfPath = path.join(articleDir, `${slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" },
    });
    console.log(`   ✅ PDF saved → ${pdfPath}`);
  } catch (err) {
    console.error(`   ❌ Error processing ${url}:`, err.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Main function
async function main() {
  console.log("🌟 Starting Dynamic Medium Scraper + Markdown + PDF Exporter\n");

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const url of ARTICLE_URLS) {
    await scrapeAndExport(url);
  }

  console.log("\n🎉 All done! Check the 'output' folder.");
}

main().catch(console.error);
