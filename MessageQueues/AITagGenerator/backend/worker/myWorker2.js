import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import { scrapeContent } from "../scraper/scrape.js";
import { buildContext } from "../rag/rag.js";
import { generateTags } from "../ai/mistral.js";

// export const worker = new Worker(
//   "ai-tag-queue",
//   async (job) => {

//     const { uri } = job.data;

//     console.log("🔍 Scraping:", uri);
//     const scraped = await scrapeContent(uri);

//     console.log("Building context...");
//     const context = buildContext(scraped.content);
//     await job.updateProgress(60);

//     const aiResult = await generateTags(context);
//     await job.updateProgress(100);
//     return{
//      originalTitle: scraped.title,
//      ai: aiResult,
//     }
//   },
//   {
//     connection,
//   },
// );
export const worker = new Worker(
  "ai-tag-queue",
  async (job) => {
    console.log("📦 Job Data:", job.data); // 👈 DEBUG LINE

    const url = job.data.url;

    if (!url) {
      throw new Error("URL is missing in job data ❌");
    }

    console.log("🔍 Scraping:", url);

    const scraped = await scrapeContent(url);

    console.log("📄 Building context...");
    const context = buildContext(scraped.content);
    await job.updateProgress(60);

    const aiResult = await generateTags(context);
    await job.updateProgress(100);

    return {
      originalTitle: scraped.title,
      ai: aiResult,
    };
  },
  {
    connection,
    lockDuration: 60000, // 🔥 FIX lock issue (important)
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Completed: ${job.id}`, job.returnvalue);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Failed: ${job.id}`, err.message);
});
