import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const stringKey = (key) => `string:${key}`;

app.post("/strings/:key", async (req, res) => {
    const value = req.body?.value;

    if (typeof value !== "string") {
        return res.status(400).json({ message: "value must be a string" });
    }

    await redis.set(stringKey(req.params.key), value);
    res.json({ success: true });
});

app.get("/strings/:key", async (req, res) => {
    const value = await redis.get(stringKey(req.params.key));

    if (value === null) {
        return res.status(404).json({ message: "String not found" });
    }

    res.json({ value });
});

app.post("/strings/:key/append", async (req, res) => {
    const value = req.body?.value;

    if (typeof value !== "string") {
        return res.status(400).json({ message: "value must be a string" });
    }

    const length = await redis.append(stringKey(req.params.key), value);
    res.json({ length });
});

app.delete("/strings/:key", async (req, res) => {
    const deleted = await redis.del(stringKey(req.params.key));
    res.json({ deleted: Boolean(deleted) });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


/**
 * // set ->
 * set name nasim
 * // get ->
 * get name
 * 
 * // auto group
 * set user: 1 nasim
 * set user: 2 reja
 * set user: 3 mondal
 * 
 * // nx -> when set when valu are not exgit
 * set msg:1 how_and_who nx
 * ->ok
 * set msg:1 how nx
 * ->nil
 * // xx
 *  
 * // mgat -> get all togather 
 * mget user:1 user:2 user3 msg:1
 * 
 */


/**
 * set count 0 -> ok
 * incr count ->1
 * incrby count 10 -> 11
 */

// subsstr // getrange // setrange
