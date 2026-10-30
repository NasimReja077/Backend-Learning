import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const bikeKey = "bike:1";
const bike = {
    model: "Deimos",
    brand: "Ergonom",
    type: "Enduro bikes",
    price: 4972,
};

try {
    await client.del(bikeKey);

    const res1 = await client.hset(bikeKey, bike);
    console.log(res1); // 4

    const res2 = await client.hget(bikeKey, "model");
    console.log(res2); // "Deimos"

    const res3 = await client.hget(bikeKey, "price");
    console.log(res3); // "4972"

    const res4 = await client.hgetall(bikeKey);
    console.log(res4);

    await client.del(bikeKey);
    await client.hset(bikeKey, bike);

    const res5 = await client.hmget(bikeKey, "model", "price");
    console.log(res5); // ["Deimos", "4972"]

    await client.del(bikeKey);
    await client.hset(bikeKey, bike);

    const res6 = await client.hincrby(bikeKey, "price", 100);
    console.log(res6); // 5072

    const res7 = await client.hincrby(bikeKey, "price", -100);
    console.log(res7); // 4972
} finally {
    await client.quit();
}




/*
import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const hashKey = (key) => `hash:${key}`;

function readFields(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return null;
    }

    const entries = Object.entries(body);
    if (entries.length === 0 || entries.some(([, value]) =>
        typeof value !== "string" && !(typeof value === "number" && Number.isFinite(value)))) {
        return null;
    }

    return Object.fromEntries(entries.map(([field, value]) => [field, String(value)]));
}

app.post("/hashes/:key", async (req, res) => {
    const fields = readFields(req.body);

    if (!fields) {
        return res.status(400).json({ message: "Body must contain at least one string or finite number field" });
    }

    const added = await redis.hset(hashKey(req.params.key), fields);
    res.json({ added });
});

app.get("/hashes/:key", async (req, res) => {
    const fields = await redis.hgetall(hashKey(req.params.key));
    res.json({ fields: Object.keys(fields).length === 0 ? null : fields });
});

app.get("/hashes/:key/field/:field", async (req, res) => {
    const value = await redis.hget(hashKey(req.params.key), req.params.field);
    res.json({ value });
});

app.post("/hashes/:key/fields", async (req, res) => {
    const { fields } = req.body ?? {};

    if (!Array.isArray(fields) || fields.length === 0 ||
        !fields.every((field) => typeof field === "string")) {
        return res.status(400).json({ message: "fields must be a non-empty array of strings" });
    }

    const values = await redis.hmget(hashKey(req.params.key), ...fields);
    res.json({ values });
});

app.get("/hashes/:key/field/:field/exists", async (req, res) => {
    const exists = await redis.hexists(hashKey(req.params.key), req.params.field);
    res.json({ exists: Boolean(exists) });
});

app.post("/hashes/:key/increment/:field", async (req, res) => {
    const { amount } = req.body ?? {};

    if (!Number.isSafeInteger(amount)) {
        return res.status(400).json({ message: "amount must be a safe integer" });
    }

    const value = await redis.hincrby(hashKey(req.params.key), req.params.field, amount);
    res.json({ value });
});

app.delete("/hashes/:key/fields", async (req, res) => {
    const { fields } = req.body ?? {};

    if (!Array.isArray(fields) || fields.length === 0 ||
        !fields.every((field) => typeof field === "string")) {
        return res.status(400).json({ message: "fields must be a non-empty array of strings" });
    }

    const removed = await redis.hdel(hashKey(req.params.key), ...fields);
    res.json({ removed });
});

app.delete("/hashes/:key", async (req, res) => {
    const deleted = await redis.del(hashKey(req.params.key));
    res.json({ deleted: Boolean(deleted) });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
*/


// HSET 
// HGET
// HMGET
// HINCRBY