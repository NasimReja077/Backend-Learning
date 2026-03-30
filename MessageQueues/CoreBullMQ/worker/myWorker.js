import { Job, Worker } from "bullmq";
import { connection } from "../config/redis.js";
const worker = new Worker(
     "test-queue",
     async (Job) => {
          console.log("⚙️ Processing:", Job.name, Job.data);

          if (Job.name === "fail-job"){
               throw new Error("Intentional failure");
          }
          await Job.updateProgress(50);
          await new Promise((res) => setTimeout(res, 2000));
          await Job.updateProgress(100);

          return "Done";
     },{
          connection, 
          concurrency: 2
     }
);

worker.on("completed", (job) => {
     console.log(`✅ Completed: ${job.id}`);
})

worker.on("failed", (job, err) => {
     console.log(`❌ Failed: ${job.id}`, err.message);
})
