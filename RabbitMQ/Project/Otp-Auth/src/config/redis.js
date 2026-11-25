
const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("Redis Error:", error);
});

const connectRedis = async () => {
  await redis.connect();
  console.log("Redis Connected");
};

module.exports = { redis, connectRedis };
