
import { createClient } from "redis";
import { getSecret } from "./secrets.js";

const redisUrl = process.env.REDIS_URL;
let redisOptions;

if (redisUrl) {
  const password = getSecret("REDIS_PASSWORD");
  const url = new URL(redisUrl);
  url.username = process.env.REDIS_USERNAME || url.username || "default";
  url.password = password;

  redisOptions = { url: url.toString() };
} else {
  redisOptions = {
    username: process.env.REDIS_USERNAME || "default",
    password: getSecret("REDIS_PASSWORD"),
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      tls: process.env.REDIS_TLS === "true",
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error("Redis reconnect limit reached");
        }
        return Math.min(retries * 500, 5000);
      }
    }
  };
}

const redisClient = createClient(redisOptions);

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis Cloud connected successfully!");
});

redisClient.on("error", (error) => {
  console.error("Redis Error:", error.message);
});

await redisClient.connect();

// Separate connection for Pub/Sub
const redisSubscriber = redisClient.duplicate();

redisSubscriber.on("error", (error) => {
  console.error("Redis Subscriber Error:", error.message);
});

await redisSubscriber.connect();

console.log("Redis Subscriber connected!");

export { redisSubscriber };

export default redisClient;
