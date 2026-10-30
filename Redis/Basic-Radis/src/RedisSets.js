import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const setKey = (key) => `set:${key}`;

function readMembers(body) {
    if (typeof body?.member === "string") {
        return [body.member];
    }

    if (Array.isArray(body?.members) && body.members.length > 0 &&
        body.members.every((member) => typeof member === "string")) {
        return body.members;
    }

    return null;
}

app.post("/sets/:key/members", async (req, res) => {
    const members = readMembers(req.body);

    if (!members) {
        return res.status(400).json({ message: "Provide a string member or an array of string members" });
    }

    const added = await redis.sadd(setKey(req.params.key), ...members);
    res.json({ added });
});

app.delete("/sets/:key/members", async (req, res) => {
    const members = readMembers(req.body);

    if (!members) {
        return res.status(400).json({ message: "Provide a string member or an array of string members" });
    }

    const removed = await redis.srem(setKey(req.params.key), ...members);
    res.json({ removed });
});

app.post("/sets/:key/contains", async (req, res) => {
    const { member } = req.body ?? {};

    if (typeof member !== "string") {
        return res.status(400).json({ message: "member must be a string" });
    }

    const isMember = await redis.sismember(setKey(req.params.key), member);
    res.json({ isMember: Boolean(isMember) });
});

app.get("/sets/:key/members", async (req, res) => {
    const members = await redis.smembers(setKey(req.params.key));
    res.json({ members });
});

app.get("/sets/:key/cardinality", async (req, res) => {
    const count = await redis.scard(setKey(req.params.key));
    res.json({ count });
});

app.post("/sets/intersection", async (req, res) => {
    const { keys } = req.body ?? {};

    if (!Array.isArray(keys) || keys.length === 0 ||
        !keys.every((key) => typeof key === "string" && key.length > 0)) {
        return res.status(400).json({ message: "keys must be a non-empty array of non-empty strings" });
    }

    const members = await redis.sinter(...keys.map(setKey));
    res.json({ members });
});

app.delete("/sets/:key", async (req, res) => {
    const deleted = await redis.del(setKey(req.params.key));
    res.json({ deleted: Boolean(deleted) });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});



// Redis Sets -> dont allow duplicate valu
// SADD -> add new member to a set
// SREM -> remove specified member from the set
// SISMEMBER 
// SINTER
// SCARD

/**
 * sadd ip 1 ->1
 * sadd ip 2 ->2
 * sadd ip 3 ->3
 * 
 * sadd ip 1 ->0
 * ----
 * srem ip 3 -> 1
 * ---
 * // if exgit or not 
 * sismember ip 1 -> 1 
 */