import express from "express";
import Redis from "ioredis";

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const cacheKey = "todos";
const cacheTtlSeconds = 30;

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});

app.get("/", async (req, res) => {
    let cachedTodos;

    try {
        cachedTodos = await redis.get(cacheKey);
    } catch (error) {
        console.error("Failed to read todos from Redis cache:", error);
    }

    if (cachedTodos !== null && cachedTodos !== undefined) {
        try {
            const todos = JSON.parse(cachedTodos);
            if (Array.isArray(todos)) {
                res.set("X-Cache", "HIT");
                return res.json(todos);
            }

            console.error("Ignoring invalid todos cache: cached value is not an array");
        } catch (error) {
            console.error("Ignoring invalid todos cache:", error);
        }

        try {
            await redis.del(cacheKey);
        } catch (error) {
            console.error("Failed to delete invalid todos cache:", error);
        }
    }

    let todos;
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos");

        if (!response.ok) {
            console.error(`Todos API returned HTTP ${response.status}`);
            return res.status(502).json({ message: "Failed to fetch todos" });
        }

        todos = await response.json();
        if (!Array.isArray(todos)) {
            console.error("Todos API returned an unexpected response");
            return res.status(502).json({ message: "Unexpected response from todos API" });
        }
    } catch (error) {
        console.error("Failed to fetch todos:", error);
        return res.status(502).json({ message: "Failed to fetch todos" });
    }

    try {
        await redis.set(cacheKey, JSON.stringify(todos), "EX", cacheTtlSeconds);
    } catch (error) {
        console.error("Failed to cache todos in Redis:", error);
    }

    res.set("X-Cache", "MISS");
    res.json(todos);
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Cached server running on http://localhost:${port}`);
});
