import { Worker } from "bullmq";
// import "dotenv/config";
import { connection } from "./config/redis.js";

export const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`📨 Processing job ${job.id}`);
    console.log(`To: ${job.data.email}`);

    // Fake email delay
    await new Promise((res) => setTimeout(res, 3000));
    console.log("✅ Email sent!");
  },
  {
    // connection: {
    //   url: process.env.REDIS_URL,
    // },
    connection,
  }
);

console.log("🚀 Worker started...");

// Graceful shutdown
process.on("SIGINT", async () => {
  await worker.close();
  console.log("Worker closed");
});