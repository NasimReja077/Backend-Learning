import { Queue } from "bullmq";
// import "dotenv/config";
import { connection } from "./config/redis.js";
// const queue = new Queue("email-queue", {
//   connection: {
//     url: process.env.REDIS_URL,
//   },
// });

const queue = new Queue("email-queue", {
  connection,
});

async function addJob() {
  const job = await queue.add("send-email", {
    email: "nasim@gmail.com",
    subject: "Welcome 🚀",
    body: "Hello Nasim, welcome to BullMQ!",
  });

  console.log("✅ Job added:", job.id);
}

addJob().catch(console.error);