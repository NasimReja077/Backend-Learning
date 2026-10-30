import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const blockingRedis = new Redis(redisUrl);
const listKey = (key) => `list:${key}`;

function readValues(body) {
    if (typeof body?.value === "string") {
        return [body.value];
    }

    if (Array.isArray(body?.values) && body.values.length > 0 &&
        body.values.every((value) => typeof value === "string")) {
        return body.values;
    }

    return null;
}

function isInteger(value) {
    return Number.isInteger(value) ||
        (typeof value === "string" && value.trim() !== "" && Number.isInteger(Number(value)));
}

app.post("/lists/:key/left", async (req, res) => {
    const values = readValues(req.body);

    if (!values) {
        return res.status(400).json({ message: "Provide a string value or an array of string values" });
    }

    const length = await redis.lpush(listKey(req.params.key), ...values);
    res.json({ length });
});

app.post("/lists/:key/right", async (req, res) => {
    const values = readValues(req.body);

    if (!values) {
        return res.status(400).json({ message: "Provide a string value or an array of string values" });
    }

    const length = await redis.rpush(listKey(req.params.key), ...values);
    res.json({ length });
});

app.get("/lists/:key", async (req, res) => {
    const start = req.query.start === undefined ? 0 : req.query.start;
    const stop = req.query.stop === undefined ? -1 : req.query.stop;

    if (!isInteger(start) || !isInteger(stop)) {
        return res.status(400).json({ message: "start and stop must be integers" });
    }

    const values = await redis.lrange(listKey(req.params.key), Number(start), Number(stop));
    res.json({ values });
});

app.delete("/lists/:key/left", async (req, res) => {
    const value = await redis.lpop(listKey(req.params.key));
    res.json({ value });
});

app.delete("/lists/:key/right", async (req, res) => {
    const value = await redis.rpop(listKey(req.params.key));
    res.json({ value });
});

app.get("/lists/:key/length", async (req, res) => {
    const length = await redis.llen(listKey(req.params.key));
    res.json({ length });
});

app.post("/lists/:source/move/:destination", async (req, res) => {
    const { from, to } = req.body ?? {};

    if (!["LEFT", "RIGHT"].includes(from) || !["LEFT", "RIGHT"].includes(to)) {
        return res.status(400).json({ message: "from and to must be LEFT or RIGHT" });
    }

    const value = await redis.lmove(
        listKey(req.params.source),
        listKey(req.params.destination),
        from,
        to
    );
    res.json({ value });
});

app.post("/lists/:key/trim", async (req, res) => {
    const { start, stop } = req.body ?? {};

    if (!isInteger(start) || !isInteger(stop)) {
        return res.status(400).json({ message: "start and stop must be integers" });
    }

    await redis.ltrim(listKey(req.params.key), Number(start), Number(stop));
    res.json({ success: true });
});

app.post("/lists/:key/blocking-pop", async (req, res) => {
    const { side = "LEFT", timeout = 10 } = req.body ?? {};

    if (!["LEFT", "RIGHT"].includes(side) || !isInteger(timeout) || Number(timeout) < 0) {
        return res.status(400).json({ message: "side must be LEFT or RIGHT and timeout must be a non-negative integer" });
    }

    const key = listKey(req.params.key);
    const result = side === "LEFT"
        ? await blockingRedis.blpop(key, Number(timeout))
        : await blockingRedis.brpop(key, Number(timeout));

    res.json({ value: result?.[1] ?? null });
});

app.delete("/lists/:key", async (req, res) => {
    const deleted = await redis.del(listKey(req.params.key));
    res.json({ deleted: Boolean(deleted) });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});



// LPUSH 
// RPUSH
// LPOP
// RPOP
// LLEN
// LMOVE
// LTRIM


/**
 * lpush messages hola -> 1
 * lpush messages hello -> 2
 * rpush messages pingpong -> 3
 * 
 * index   |    0   |    1   |      2    |
 * eliment | hello  |   hola | pingpong  |
 * ----
 * lpop messages -> hello
 * rpop messages -> pingpong
 * ----
 * llen messages -> 0
 * 
 * 
 * BLPOP
 * blpop messages 10
 * blpop messages 20
 * 
 * 
 * lrange messages 0 -1
 * lrange messages 0 1
 */

// del mssa key

// KEYS user:*-