import express from "express";
import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { connection } from "./config/redis.js";
import "./worker.js"; // 👈 THIS LINE AUTO STARTS WORKER

// const connection = {
//   url: process.env.REDIS_URL,
// }; // 

const queue = new Queue("email-queue", { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

const app = express();

app.use("/admin/queues", serverAdapter.getRouter());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/admin/queues`);
});