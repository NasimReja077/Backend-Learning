import { myQueue } from "../queue/myQueue.js";

setInterval(async () => {
  const waiting = await myQueue.getWaitingCount();
  const active = await myQueue.getActiveCount();
  const completed = await myQueue.getCompletedCount();
  const failed = await myQueue.getFailedCount();

  console.log("\n📊 Queue Stats:");
  console.log("Waiting:", waiting);
  console.log("Active:", active);
  console.log("Completed:", completed);
  console.log("Failed:", failed);
}, 5000);

