import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

export const myQueue = new Queue("test-queue", { connection });