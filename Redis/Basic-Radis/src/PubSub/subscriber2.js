
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Dedicated subscriber connection
const subscriber = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

// Subscribe to multiple channels
await subscriber.subscribe(
    "notifications",
    "orders:created"
);

console.log("Subscribed to notification and order channels");

// Receive normal channel messages
subscriber.on("message", (channel, message) => {
    try {
        const payload = JSON.parse(message);

        console.log("\nNew message received!");
        console.log("Channel:", channel);
        console.log("Payload:", payload);

    } catch (error) {
        console.error("Invalid message:", error.message);
    }
});

// Handle connection errors
subscriber.on("error", (error) => {
    console.error("Redis subscriber error:", error);
});
