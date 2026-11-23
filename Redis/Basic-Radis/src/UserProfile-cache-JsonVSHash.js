import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/user/:id/json", async (req, res) => {
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
    res.json({ savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
    const raw = await redis.get(`user:${req.params.id}:json`);
    res.json({ user: raw ? JSON.parse(raw) : null });
});

app.post("/user/:id/hash", async (req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({ savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
    const user = await redis.hgetall(`user:${req.params.id}:hash`);
    res.json({ user });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


// set -> store singlee variable
// hset -> store object
// hgetall -> like getting entier object
// hset -> store object with multiple fields
// hget -> get single field from hash
// hdel -> delete single field from hash
// hlen -> get number of fields in hash
// hkeys -> get all field names in hash
// hexists -> check if field exists in hash
// when to use - if you need to store and manage user profiles, shopping carts, or application settings where each entity has multiple attributes, such as name, email, age, etc. Hashes are ideal for representing structured data with key-value pairs.

// example - storing user profiles, shopping carts, or application settings where each entity has multiple attributes, such as name, email, age, etc. Hashes are ideal for representing structured data with key-value pairs.


/**
 * 4. Other important Redis Hash commands
These commands are useful when working with user profiles, shopping carts, and application settings.
Command	Purpose	Example
HSET	        Add/update fields	            HSET user:101 age 24
HGET	        Get one field	                HGET user:101 name
HGETALL	        Get all fields	                HGETALL user:101
HMGET	        Get multiple selected fields	HMGET user:101 name age
HDEL	        Delete fields	                HDEL user:101 age
HEXISTS	        Check if a field exists	HEXISTS user:101 name
HLEN	        Count fields	                HLEN user:101
HKEYS	        Get all field names	            HKEYS user:101
HVALS	        Get all values	                HVALS user:101
HINCRBY	        Increment a numeric field	    HINCRBY user:101 age 1
HSETNX	        Set only if field doesn't exist	 HSETNX user:101 name "Nasim
HMSET	        Set multiple fields	            HMSET user:101 name "Nasim" age 24 email "
 */