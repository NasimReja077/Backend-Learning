import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const URL = "https://medium.com/@ebjonsberg/how-i-build-a-blog-with-nextjs-and-sanity-d1f06bcc98e7";

async function scrapeMediumArticle() {
    let browser;

    try {
        console.log("🚀 Launching browser...");

        browser = await puppeteer.launch({
            headless: false,           // Change to true when you're done testing
            defaultViewport: { width: 1366, height: 768 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Better navigation with timeout handling
        console.log(`📄 Navigating to: ${URL}`);
        await page.goto(URL, {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        // Get basic info
        const title = await page.title();
        console.log("📌 Page Title:", title);

        // Wait for article to load
        await page.waitForSelector("article", { timeout: 10000 });

        // ==================== DATA EXTRACTION ====================

        const articleData = await page.evaluate(() => {
            const article = document.querySelector("article");
            if (!article) return null;

            // Get main title
            const mainTitle = document.querySelector("h1")?.innerText.trim() || "";

            // Get author name
            const author = document.querySelector('a[href*="/@"]')?.innerText.trim() || 
                          document.querySelector('[data-testid="authorName"]')?.innerText.trim() || "Unknown";

            // Get all paragraphs and headings
            const contentElements = Array.from(article.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, pre, blockquote"));

            const content = contentElements.map(el => ({
                type: el.tagName.toLowerCase(),
                text: el.innerText.trim()
            })).filter(item => item.text.length > 0);

            // Get reading time & publish date
            const readingTime = document.querySelector('span')?.innerText.match(/\d+\s*min/)?.[0] || "N/A";
            const publishDate = document.querySelector('time')?.getAttribute('datetime') || "N/A";

            return {
                mainTitle,
                author,
                readingTime,
                publishDate,
                content,
                totalParagraphs: content.filter(item => item.type === "p").length,
                scrapedAt: new Date().toISOString()
            };
        });

        if (!articleData) {
            throw new Error("Could not extract article data");
        }

        console.log(`✅ Successfully scraped article by ${articleData.author}`);
        console.log(`📝 Total paragraphs: ${articleData.totalParagraphs}`);

        // ==================== SAVE DATA ====================

        const outputDir = "./output";
        await fs.mkdir(outputDir, { recursive: true });

        const fileName = `medium-article-${Date.now()}.json`;
        const filePath = path.join(outputDir, fileName);

        await fs.writeFile(filePath, JSON.stringify(articleData, null, 2));

        console.log(`💾 Data saved to: ${filePath}`);

        // Take screenshots
        await page.screenshot({
            path: path.join(outputDir, "full-page.png"),
            fullPage: true
        });

        const articleElement = await page.$("article");
        if (articleElement) {
            await articleElement.screenshot({
                path: path.join(outputDir, "article-only.png")
            });
        }

        console.log("📸 Screenshots saved successfully!");

    } catch (error) {
        console.error("❌ Error occurred:", error.message);
    } finally {
        if (browser) {
            await browser.close();
            console.log("🔒 Browser closed.");
        }
    }
}

// Run the scraper
scrapeMediumArticle();