import { QueueEvents } from "bullmq";
import { connection } from "../config/redis.js";

const queueEvents = new QueueEvents("test-queue", { connection });

queueEvents.on("waiting", ({ jobId }) => {
     console.log(`⏳ Job waiting: ${jobId}`);
});

queueEvents.on("active", ({ jobId }) => {
     console.log(`⏳ Job started: ${jobId}`);
});

queueEvents.on("progress", ({ jobId, data }) => {
     console.log(`Job ${jobId} progress: ${data}%`);
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`🎉 Job ${jobId} done:`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`💥 Job ${jobId} failed:`, failedReason);
});