import Redis from "ioredis";

let redis = null;

export const connectRedis = async () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    await redis.connect();
    console.log("✅ Redis connected (token blacklist store)");

    redis.on("error", (err) => {
      console.warn("⚠️  Redis error:", err.message);
    });
  } catch (err) {
    console.warn("⚠️  Redis unavailable – token blacklisting disabled:", err.message);
    redis = null;
  }
};

export const getRedis = () => redis;

// Blacklist a token (set with TTL matching JWT expiry ~7 days)
export const blacklistToken = async (token) => {
  if (!redis) return;
  await redis.set(`blacklist_${token}`, "1", "EX", 7 * 24 * 60 * 60);
};

export const isTokenBlacklisted = async (token) => {
  if (!redis) return false;
  const val = await redis.get(`blacklist_${token}`);
  return val !== null;
};
