import { QueueEvents } from "bullmq";
import { connection } from "../config/redis.js";

const events = new QueueEvents("ai-tag-queue", { connection });

events.on("progress", ({ jobId, data }) => {
  console.log(`📊 Job ${jobId} progress: ${data}%`);
});

events.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Done ${jobId}:`, returnvalue);
});
