import puppeteer from "puppeteer";

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://medium.com/@dilarauluturhan/javascript-dom-document-object-model-85a2bc72769c", {
        waitUntil: "networkidle2",
    });

    const title = await page.title();
    console.log("Title:", title);

    // === NEW: Screenshot of specific element ===
    // Find the main article content (Medium uses <article> tag)
    const article = await page.waitForSelector('article');

    if (article) {
        await article.screenshot({
            path: "article-screenshot.png",
        });
        console.log("✅ Specific element (article) screenshot saved as article-screenshot.png");
    } else {
        console.log("❌ Could not find article element");
    }

    // Optional: Also save full page for comparison
    await page.screenshot({
        path: "full-page-screenshot.png",
        fullPage: true,
    });
    console.log("✅ Full page screenshot saved");

    await browser.close();
}

run().catch(console.error);











// import puppeteer from "puppeteer";

// async function run() {
//     // 1. Launch browser (fixed spelling)
//     const browser = await puppeteer.launch({
//         headless: false,        // show browser
//         // You can also add this for better compatibility sometimes:
//         // args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });

//     // 2. Open new page
//     const page = await browser.newPage();

//     // 3. Go to the Medium article
//     await page.goto("https://medium.com/@dilarauluturhan/javascript-dom-document-object-model-85a2bc72769c", {
//         waitUntil: "networkidle2",
//     });

//     // 4. Get page title
//     const title = await page.title();
//     console.log("Title:", title);

//     // 5. Take full-page screenshot
//     await page.screenshot({
//         path: "screenshot.png",
//         fullPage: true,
//     });

//     console.log("✅ Screenshot saved as screenshot.png");

//     // 6. Close browser
//     await browser.close();
// }

// run().catch(console.error);   // Good practice: catch errors