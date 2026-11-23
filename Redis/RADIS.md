**Redis Fundamentals & Architecture**  
Complete, detailed explanation with definitions, examples, pros/cons, real-life cases, architecture diagram, and a small project.

> Redis is short for **Remote Dictionary Server**. This guide is designed for learning and interview revision. Run commands with `redis-cli`; Node.js examples use `ioredis`.

---

## Interview Master Index

| Topic | Where to study |
|---|---|
| Redis fundamentals, architecture, pros/cons | Sections 1-6 |
| Strings, hashes, lists, sets, sorted sets | Data Type sections |
| Streams, bitmap, HyperLogLog, geospatial data | Advanced Data Types |
| Keys, TTL, memory, eviction, big keys | Keys & Memory sections |
| Pub/Sub, caching, locks, rate limiting | Distributed Systems sections |
| Security, persistence, replication, cluster | Production & Interview sections |
| Ultimate revision page | [Interview Master Page](#interview-master-page) |

### 60-Second Interview Answer

Redis is an open-source, in-memory data structure store commonly used for caching, sessions, queues, counters, pub/sub, leaderboards, rate limiting, and real-time features. It stores keys and rich values such as strings, hashes, lists, sets, sorted sets, streams, and bitmaps. Redis uses an event-driven architecture and is typically single-threaded for command execution, so commands are processed atomically. Redis supports RDB snapshots, append-only files, replication, Sentinel, and Cluster. It is extremely fast because the working set is in RAM, although it must be sized and monitored carefully.

---

### 1. Definition

**Redis** (Remote Dictionary Server) is an **open-source, in-memory data structure store**.

It can be used as:
- Database
- Cache
- Message broker
- Real-time analytics engine

Unlike traditional databases (MySQL, PostgreSQL) that store data primarily on disk, Redis keeps the entire working dataset in **RAM**, which makes it extremely fast.

---

### 2. Why is Redis so Fast?

| Reason | Explanation |
|--------|-----------|
| **In-memory storage** | Data lives in RAM (nanosecond access) instead of disk (millisecond access) |
| **Single-threaded command execution** | No locking or context switching between threads for commands |
| **Efficient data structures** | Highly optimized C implementations (hash tables, skiplists, etc.) |
| **I/O Multiplexing** | Uses `epoll` / `kqueue` to handle thousands of connections with one thread |
| **Simple protocol** | RESP (REdis Serialization Protocol) is lightweight |

**Note (Redis 6+):**  
Redis added **I/O threads** for network reading/writing, but **command execution remains single-threaded**.

---

### 3. Core Architecture

```
+---------------------------------------------------------------+
|                        Redis Server                           |
|                                                               |
|  +-------------------+     +-----------------------------+   |
|  |   Client Connections |   |     Event Loop (Single Thread) |   |
|  |  (thousands)         |   |  - Accept connections         |   |
|  +----------+----------+   |  - Read commands               |   |
|             |              |  - Execute commands            |   |
|             |              |  - Write replies               |   |
|             v              +-----------------------------+   |
|  +-------------------+                                       |
|  |   I/O Multiplexing |  (epoll / kqueue)                     |
|  +-------------------+                                       |
|                                                               |
|  +-------------------------------------------------------+   |
|  |              In-Memory Data Structures                |   |
|  |  Strings | Hashes | Lists | Sets | Sorted Sets | Streams |   |
|  +-------------------------------------------------------+   |
|                                                               |
|  +-------------------+     +-----------------------------+   |
|  |   Persistence     |     |   Replication / Cluster     |   |
|  |  (RDB / AOF)      |     |   (Master-Replica / Slots)  |   |
|  +-------------------+     +-----------------------------+   |
+---------------------------------------------------------------+
```

**Key Components:**

1. **Event Loop** → Single thread that processes all commands one by one.
2. **In-Memory Dataset** → All data lives in RAM.
3. **Persistence Layer** → Optional (RDB snapshots or AOF log).
4. **Networking** → Non-blocking I/O using multiplexing.

---

### 4. Important Concepts & Definitions

| Term | Definition |
|------|----------|
| **Key** | Unique name that identifies a value (like a variable name) |
| **Value** | The actual data (can be String, Hash, List, etc.) |
| **TTL** | Time To Live – automatic expiration time of a key |
| **Atomic Operation** | An operation that either fully succeeds or fully fails (no partial update) |
| **RESP** | Redis protocol used for client-server communication |
| **Single-threaded** | Only one command runs at a time (guarantees atomicity) |

---

### 5. Pros and Cons

**Pros**
- Extremely high performance (100,000+ operations/second)
- Rich data structures (not just key-value)
- Atomic operations by design
- Built-in replication, persistence, pub/sub
- Simple to use and deploy
- Excellent for caching and real-time use cases

**Cons**
- Data must fit in memory (expensive for very large datasets)
- Single-threaded → one slow command can block everything
- Persistence is not as strong as traditional databases by default
- Risk of data loss if not configured properly
- Memory cost is higher than disk-based databases

---

### 6. Real-Life Examples

| Company / Use Case | How Redis is Used |
|--------------------|-------------------|
| **Twitter** | Timeline caching, rate limiting |
| **GitHub** | Session storage, caching |
| **Uber** | Real-time driver location, surge pricing |
| **Pinterest** | User feeds, follower graphs |
| **Stack Overflow** | Caching hot questions & answers |
| **E-commerce sites** | Shopping cart, product cache, inventory counters |

---

### 7. Basic Commands Example

```bash
# Set a key
SET user:1001:name "Rahul"

# Get the value
GET user:1001:name

# Set with expiration (60 seconds)
SET session:abc123 "logged_in" EX 60

# Check remaining time
TTL session:abc123

# Atomic counter
INCR page:views:homepage
```

---

### 8. Key Naming Best Practices

**Good:**
```
user:1001:profile
order:2026:items
session:user:1001
```

**Bad:**
```
u1001
data1
temp
```

---

### 9. Small Project Example (for Understanding)

**Project Name:** Simple Page View Counter + Cache

**Goal:**  
Count how many times a page is visited and cache the result for 30 seconds.

#### Step-by-step:

**Updated for MERN (Node.js + Express)**

Here’s the same **Page View Counter + Cache** example converted to Node.js (MERN stack).

### 1. Install Required Packages

```bash
npm install express redis
# or (recommended)
npm install express ioredis
```

---

### 2. Complete Code (using `ioredis` - recommended)

```js
// server.js
const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// Helper function - Cache Aside Pattern
async function getPageViews(pageId) {
  const cacheKey = `page:${pageId}:views`;

  // 1. Try to get from Redis cache
  const cachedViews = await redis.get(cacheKey);

  if (cachedViews !== null) {
    console.log('Cache HIT');
    return parseInt(cachedViews);
  }

  console.log('Cache MISS - calculating...');

  // 2. Simulate slow database call
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  const views = 15420; // Fake DB result

  // 3. Store in Redis with 30 seconds TTL
  await redis.set(cacheKey, views, 'EX', 30);

  return views;
}

// API Endpoint
app.get('/views/:pageId', async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const views = await getPageViews(pageId);

    res.json({
      success: true,
      pageId,
      views,
      message: 'Page views fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### 3. How to Test

1. Make sure Redis is running:
```bash
docker run -d --name redis -p 6379:6379 redis
```

2. Run the server:
```bash
node server.js
```

3. Test in browser or Postman:
```
http://localhost:5000/views/home
```

**First request** → Cache MISS (takes ~1 second)  
**Next requests (within 30 seconds)** → Cache HIT (very fast)

---

### 4. Bonus: Using Official `redis` package (alternative)

```js
const { createClient } = require('redis');

const redis = createClient({
  url: 'redis://localhost:6379'
});

redis.connect();

async function getPageViews(pageId) {
  const cacheKey = `page:${pageId}:views`;

  const cachedViews = await redis.get(cacheKey);

  if (cachedViews !== null) {
    console.log('Cache HIT');
    return parseInt(cachedViews);
  }

  console.log('Cache MISS - calculating...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const views = 15420;

  await redis.set(cacheKey, views, { EX: 30 });

  return views;
}
```

---

Would you like me to also give you:
- Full MERN version (with MongoDB instead of fake data)?
- React frontend example to call this API?
- Or continue with the next Redis topic (Core Data Structures)?

**What you learn from this small project:**
- How Redis works as a cache
- Cache-Aside pattern
- TTL (expiration)
- Key naming
- Atomic and fast operations

---

### Summary

Redis is fast because:
1. Everything is in memory
2. Single-threaded (no locking overhead)
3. Optimized data structures
4. Non-blocking I/O

It is best used when you need **speed + simple data structures + real-time features**.
---
---
**Redis Data Type: String**  
(Complete guide for MERN / Node.js developers)

### 1. What is a Redis String?

A **String** is the simplest and most commonly used data type in Redis.  
It can store:
- Text
- Numbers
- Binary data (images, serialized JSON, etc.)
- Maximum size: **512 MB**

Even though it’s called “String”, you can use it for numbers and do atomic operations (`INCR`, `DECR`, etc.).

---

### 2. Main Use Cases

| Use Case              | Description                              | Example Key                  |
|-----------------------|------------------------------------------|------------------------------|
| **Caching**           | Store API responses or DB results        | `user:1001:profile`         |
| **Counters**          | Page views, likes, inventory             | `page:home:views`            |
| **Feature Flags**     | Enable/disable features                  | `feature:dark_mode`          |
| **Tokens / Sessions** | JWT, OTP, session IDs                    | `session:abc123`             |
| **Simple Values**     | Config values, temporary data            | `site:maintenance`           |
| **Distributed Locks** | Prevent race conditions                  | `lock:order:5001`            |
| **Rate Limiting**     | Limit API requests                       | `ratelimit:user:1001`        |

---

### 3. Key Commands (Most Important)

| Command                  | Description                          | Example |
|--------------------------|--------------------------------------|-------|
| `SET key value`          | Set a value                          | `SET name "Rahul"` |
| `GET key`                | Get a value                          | `GET name` |
| `SET key value EX seconds` | Set with expiration                | `SET session:1 "data" EX 3600` |
| `SETEX key seconds value`| Same as above                        | `SETEX token 300 "abc123"` |
| `SETNX key value`        | Set only if key does **not** exist   | Used for locks |
| `INCR key`               | Increase by 1 (atomic)               | `INCR views` |
| `INCRBY key number`      | Increase by number                   | `INCRBY views 10` |
| `DECR key`               | Decrease by 1                        | `DECR stock` |
| `APPEND key value`       | Append text                          | `APPEND name " Sharma"` |
| `STRLEN key`             | Get length of string                 | `STRLEN name` |
| `GETSET key value`       | Get old value + set new value        | - |
| `MSET` / `MGET`          | Set/Get multiple keys at once        | Faster than multiple calls |
| `DEL key`                | Delete key                           | `DEL name` |

---

### 4. Expiration (TTL)

You can make any String automatically expire.

```js
// Using ioredis
await redis.set('session:abc123', 'user_data', 'EX', 3600); // expires in 1 hour
await redis.set('otp:987654', '482913', 'EX', 300);         // expires in 5 minutes

// Check remaining time
const ttl = await redis.ttl('session:abc123'); // returns seconds left
```

**Common options:**
- `EX` → seconds
- `PX` → milliseconds
- `EXAT` → expire at Unix timestamp
- `KEEPTTL` → keep existing TTL when updating

---

### 5. Practical Use Cases with MERN Examples

#### A. Caching (Most Common)

```js
// Cache user profile for 10 minutes
const cacheKey = `user:${userId}:profile`;

let user = await redis.get(cacheKey);

if (user) {
  return JSON.parse(user); // Cache HIT
}

// Cache MISS → get from MongoDB
user = await User.findById(userId);
await redis.set(cacheKey, JSON.stringify(user), 'EX', 600); // 10 min

return user;
```

#### B. Counters (Page Views / Likes)

```js
// Increase page views
await redis.incr(`page:${pageId}:views`);

// Get current views
const views = await redis.get(`page:${pageId}:views`);
```

#### C. Feature Flags

```js
// Enable dark mode feature
await redis.set('feature:dark_mode', 'true');

// Check if feature is enabled
const isEnabled = await redis.get('feature:dark_mode') === 'true';
```

#### D. OTP / Tokens

```js
// Store OTP for 5 minutes
await redis.set(`otp:${phone}`, '482913', 'EX', 300);

// Verify OTP
const savedOtp = await redis.get(`otp:${phone}`);
if (savedOtp === userEnteredOtp) {
  // success
  await redis.del(`otp:${phone}`); // delete after use
}
```

#### E. Simple Distributed Lock

```js
// Try to acquire lock
const result = await redis.set('lock:order:1001', 'locked', 'EX', 30, 'NX');

if (result === 'OK') {
  // Lock acquired
  // do your work...
  await redis.del('lock:order:1001'); // release lock
} else {
  // Lock already taken
}
```

---

### 6. Pros & Cons of String

**Pros:**
- Extremely simple and fast
- Supports atomic operations (`INCR`, `SETNX`)
- Perfect for caching and counters
- Can store JSON (as string)

**Cons:**
- Not good for complex objects (use Hash instead)
- If you store large JSON and update one field → you rewrite the whole value
- Maximum 512 MB per key

---

### 7. Small Practice Project (MERN)

**Project:** Simple API Hit Counter + Feature Flag

```js
// routes/counter.js
router.get('/hit', async (req, res) => {
  // Increase total hits
  const hits = await redis.incr('api:total_hits');

  // Check feature flag
  const showBanner = await redis.get('feature:show_banner') === 'true';

  res.json({
    totalHits: hits,
    showBanner
  });
});
```

---
**Redis String – Complete Detailed Guide + Cheat Sheet**  
(For MERN / Node.js Developers)

### 1. Deep Dive: What is a Redis String?

A Redis String is the most basic and versatile data type. Internally, Redis stores strings in a highly optimized way:

- Small strings → stored as `embstr` or `raw`
- Numbers → can be stored as integers for faster `INCR`/`DECR`
- Maximum size: **512 MB** per key

Even though it’s called “String”, you can treat it as:
- Text
- Integer / Counter
- Boolean (using `"true"` / `"false"` or `1` / `0`)
- JSON (by stringifying)
- Binary data

---

### 2. When Should You Use String?

| Situation                        | Use String? | Better Alternative |
|----------------------------------|-------------|--------------------|
| Simple caching (JSON, HTML)      | Yes         | -                  |
| Counters (views, likes)          | Yes         | -                  |
| Feature flags / Config           | Yes         | -                  |
| OTP, tokens, session IDs         | Yes         | -                  |
| Distributed locks                | Yes         | -                  |
| Storing full objects with many fields | No      | **Hash**           |
| Lists of items                   | No          | **List** or **Set**|
| Rankings / Leaderboards          | No          | **Sorted Set**     |

---

### 3. Complete Cheat Sheet (Most Important)

#### Basic Commands

| Command                        | Description                              | Node.js (ioredis) Example |
|--------------------------------|------------------------------------------|---------------------------|
| `SET key value`                | Set value                                | `await redis.set('name', 'Rahul')` |
| `GET key`                      | Get value                                | `await redis.get('name')` |
| `SET key value EX seconds`     | Set + expire in seconds                  | `await redis.set('key', 'val', 'EX', 60)` |
| `SET key value PX milliseconds`| Set + expire in ms                       | `await redis.set('key', 'val', 'PX', 5000)` |
| `SETEX key seconds value`      | Same as SET + EX                         | `await redis.setex('key', 60, 'val')` |
| `SETNX key value`              | Set only if key does **not** exist       | `await redis.setnx('lock', '1')` |
| `GETSET key value`             | Get old value and set new one            | `await redis.getset('key', 'new')` |
| `MSET key1 val1 key2 val2`     | Set multiple keys at once                | `await redis.mset('a', 1, 'b', 2)` |
| `MGET key1 key2`               | Get multiple keys at once                | `await redis.mget('a', 'b')` |

#### Counter Commands (Atomic)

| Command              | Description                     | Example |
|----------------------|---------------------------------|-------|
| `INCR key`           | +1                              | `await redis.incr('views')` |
| `INCRBY key number`  | +N                              | `await redis.incrby('views', 10)` |
| `INCRBYFLOAT key n`  | + float number                  | `await redis.incrbyfloat('price', 1.5)` |
| `DECR key`           | -1                              | `await redis.decr('stock')` |
| `DECRBY key number`  | -N                              | `await redis.decrby('stock', 5)` |

#### Expiration Commands

| Command                  | Description                          | Example |
|--------------------------|--------------------------------------|-------|
| `EXPIRE key seconds`     | Set TTL                              | `await redis.expire('key', 300)` |
| `PEXPIRE key ms`         | Set TTL in milliseconds              | `await redis.pexpire('key', 5000)` |
| `TTL key`                | Get remaining seconds (-1 = no TTL, -2 = key not exist) | `await redis.ttl('key')` |
| `PTTL key`               | Get remaining milliseconds           | `await redis.pttl('key')` |
| `PERSIST key`            | Remove expiration                    | `await redis.persist('key')` |

#### Other Useful Commands

| Command              | Description                          |
|----------------------|--------------------------------------|
| `APPEND key value`   | Append text to existing string       |
| `STRLEN key`         | Get length of string                 |
| `GETRANGE key start end` | Get substring                     |
| `SETRANGE key offset value` | Overwrite part of string        |
| `DEL key`            | Delete key                           |
| `EXISTS key`         | Check if key exists (returns 1 or 0) |

---

### 4. Advanced SET Options (Very Useful)

```js
// SET with multiple options
await redis.set('session:123', 'user_data', 'EX', 3600, 'NX');  
// EX = expire, NX = only set if Not eXists

await redis.set('key', 'value', 'XX');     // Only set if key already exists
await redis.set('key', 'value', 'KEEPTTL'); // Update value but keep existing TTL
```

---

### 5. Real-World Patterns (MERN)

**1. Caching with JSON**
```js
const user = await User.findById(id);
await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 600);
```

**2. Atomic Counter**
```js
const views = await redis.incr(`post:${postId}:views`);
```

**3. OTP System**
```js
await redis.set(`otp:${phone}`, otp, 'EX', 300); // 5 minutes
```

**4. Feature Flag**
```js
await redis.set('feature:new_ui', 'true');
const enabled = (await redis.get('feature:new_ui')) === 'true';
```

**5. Simple Distributed Lock**
```js
const lock = await redis.set('lock:resource', 'locked', 'EX', 10, 'NX');
if (lock === 'OK') {
  // Got the lock
}
```

---

### 6. Best Practices

- Always use meaningful key names: `user:1001:session`
- Prefer `SET key value EX seconds` instead of separate `EXPIRE`
- Use `MGET` / `MSET` when working with multiple keys
- Never store very large objects as String (use Hash)
- Always set TTL on temporary data (sessions, OTPs, cache)
- Use `INCR` instead of `GET` + `SET` for counters (atomic + faster)

---

### 7. Common Mistakes

| Mistake                              | Solution                              |
|--------------------------------------|---------------------------------------|
| Forgetting to set TTL on cache       | Always use `EX`                       |
| Using String for objects with many fields | Use **Hash** instead              |
| Doing `GET` → modify → `SET` for counters | Use `INCR` / `INCRBY`            |
| Not handling `null` when key expires | Always check if value is `null`       |

---
---
**Redis Data Type: Hash**  
Complete Detailed Guide (MERN / Node.js Focus)

### 1. Definition

A **Redis Hash** is a map of **field-value pairs** stored under a single key.  
Think of it as a small JavaScript object or Python dictionary inside Redis.

Example:
```js
Key: user:1001
Field          Value
------         -------
name     →     "Rahul"
email    →     "rahul@gmail.com"
age      →     "25"
city     →     "Delhi"
```

---

### 2. Why Hash is Better than String for Objects?

| Feature                    | String                          | Hash                              |
|---------------------------|----------------------------------|-----------------------------------|
| Store object              | Need `JSON.stringify()`          | Native field-value pairs          |
| Update one field          | Rewrite entire object            | Update only that field            |
| Get one field             | Get full object + parse          | Get only required field           |
| Memory efficiency         | Higher (for many small objects)  | Better                            |
| Partial update            | No                               | Yes                               |

**Rule of Thumb:**  
- Use **String** → simple values, counters, full JSON cache  
- Use **Hash** → objects with multiple fields (user profile, session, product, etc.)

---

### 3. Architecture Diagram

```
+---------------------------------------------+
|                 Redis Hash                  |
|                                             |
|  Key: user:1001                             |
|                                             |
|  +----------+----------+                    |
|  |  Field   |  Value   |                    |
|  +----------+----------+                    |
|  |  name    |  Rahul   |                    |
|  |  email   |  r@g.com |                    |
|  |  age     |  25      |                    |
|  |  city    |  Delhi   |                    |
|  +----------+----------+                    |
|                                             |
|  Internally stored as:                      |
|  - ziplist (small hash) → very memory efficient |
|  - hashtable (large hash)                   |
+---------------------------------------------+
```

---

### 4. Field-Level Operations & Memory Efficiency

**Field-level operations** mean you can read/write/update **individual fields** without touching other fields.

**Memory Efficiency:**
- Small hashes (few fields + small values) are stored in a special compressed format called **listpack / ziplist**.
- This makes Hashes **very memory efficient** compared to storing many separate String keys.
- When the hash grows large, Redis automatically converts it to a normal hash table.

**Recommendation:**  
Prefer one Hash with many fields over many individual String keys when storing objects.

---

### 5. Main Use Cases

| Use Case              | Example Key             | Why Hash is Perfect              |
|-----------------------|-------------------------|----------------------------------|
| User Profiles         | `user:1001`             | Easy partial updates             |
| Session Data          | `session:abc123`        | Store multiple session fields    |
| Shopping Cart         | `cart:1001`             | Product ID as field, quantity as value |
| Product Information   | `product:5001`          | name, price, stock, etc.         |
| Configuration         | `config:app`            | Multiple settings                |
| Player Stats (Game)   | `player:777`            | score, level, health, etc.       |

---

### 6. Complete Cheat Sheet (Hash Commands)

#### Basic Commands

| Command                          | Description                              | ioredis Example |
|----------------------------------|------------------------------------------|-----------------|
| `HSET key field value`           | Set one field                            | `await redis.hset('user:1', 'name', 'Rahul')` |
| `HSET key field1 val1 field2 val2`| Set multiple fields                     | `await redis.hset('user:1', {name: 'Rahul', age: 25})` |
| `HGET key field`                 | Get one field                            | `await redis.hget('user:1', 'name')` |
| `HGETALL key`                    | Get all fields + values                  | `await redis.hgetall('user:1')` |
| `HMGET key field1 field2`        | Get multiple fields                      | `await redis.hmget('user:1', 'name', 'age')` |
| `HDEL key field1 field2`         | Delete one or more fields                | `await redis.hdel('user:1', 'age')` |
| `HEXISTS key field`              | Check if field exists                    | `await redis.hexists('user:1', 'email')` |
| `HKEYS key`                      | Get all field names                      | `await redis.hkeys('user:1')` |
| `HVALS key`                      | Get all values                           | `await redis.hvals('user:1')` |
| `HLEN key`                       | Number of fields                         | `await redis.hlen('user:1')` |

#### Numeric Operations

| Command                      | Description                        | Example |
|-----------------------------|------------------------------------|-------|
| `HINCRBY key field number`  | Increase field by integer          | `await redis.hincrby('user:1', 'age', 1)` |
| `HINCRBYFLOAT key field n`  | Increase field by float            | `await redis.hincrbyfloat('product:1', 'price', 9.99)` |

#### Other Useful Commands

| Command                        | Description                              |
|--------------------------------|------------------------------------------|
| `HSETNX key field value`       | Set field only if it does **not** exist  |
| `HSTRLEN key field`            | Get length of a field's value            |
| `HRANDFIELD key [count]`       | Get random field(s)                      |

---

### 7. Real-Life Examples

| Company / App       | How they use Hash                          |
|---------------------|--------------------------------------------|
| **Amazon**          | Shopping cart (`cart:userId`)             |
| **Netflix**         | User preferences & viewing progress        |
| **Uber**            | Driver / Rider profile + current status    |
| **Instagram**       | User profile basic info                    |
| **E-commerce sites**| Product details, Inventory per size/color  |
| **Gaming apps**     | Player stats (score, level, coins, etc.)   |

---

### 8. Pros & Cons

**Pros:**
- Excellent memory efficiency for objects
- Field-level read/write (partial updates)
- Atomic operations on individual fields
- Perfect replacement for small objects
- Supports `HINCRBY` (very useful)

**Cons:**
- Cannot set different TTL for individual fields (until Redis 7.4+)
- `HGETALL` can be slow if hash has thousands of fields (avoid big hashes)
- Slightly more complex than String

---

### 9. Small Project Example (MERN)

**Project:** User Profile Management using Redis Hash

```js
// controllers/userController.js
const redis = require('../redis'); // ioredis instance

// Create / Update User Profile
async function saveUserProfile(userId, data) {
  const key = `user:${userId}`;
  await redis.hset(key, data);           // data = { name, email, age, city }
  await redis.expire(key, 3600);         // optional: expire in 1 hour
}

// Get full profile
async function getUserProfile(userId) {
  return await redis.hgetall(`user:${userId}`);
}

// Get only specific fields
async function getUserNameAndEmail(userId) {
  return await redis.hmget(`user:${userId}`, 'name', 'email');
}

// Update only age
async function updateAge(userId, newAge) {
  await redis.hset(`user:${userId}`, 'age', newAge);
}

// Increase age by 1
async function incrementAge(userId) {
  await redis.hincrby(`user:${userId}`, 'age', 1);
}
```

**Usage Example:**

```js
// Save profile
await saveUserProfile(1001, {
  name: 'Rahul',
  email: 'rahul@gmail.com',
  age: 25,
  city: 'Delhi'
});

// Get full profile
const profile = await getUserProfile(1001);
console.log(profile);
// { name: 'Rahul', email: 'rahul@gmail.com', age: '25', city: 'Delhi' }
```

---

### 10. Best Practices

1. Use Hash for any object that has multiple fields.
2. Keep hashes reasonably small (hundreds of fields is fine, avoid tens of thousands).
3. Prefer `HSET` with object syntax in ioredis.
4. Use `HMGET` instead of multiple `HGET`.
5. Always consider setting TTL on the whole hash key.
6. From Redis 7.4+ you can set expiration on individual hash fields (`HEXPIRE`).

---
---

**Redis Data Type: List**  
Complete Detailed Guide (MERN / Node.js Focus)

### 1. Definition

A **Redis List** is a collection of ordered strings.  
It works like a **linked list** (not an array).

- You can add/remove elements from both ends (head and tail) very efficiently.
- Elements are ordered by insertion sequence.
- Maximum length: **2³² - 1** elements (more than 4 billion).

Think of it as a flexible array that is extremely fast when working on the left or right end.

---

### 2. How List Works Internally

```
Left (Head)                          Right (Tail)
   ↓                                    ↓
+------+    +------+    +------+    +------+
| item | ←→ | item | ←→ | item | ←→ | item |
+------+    +------+    +------+    +------+
```

- `LPUSH` / `LPOP` → work on Left side
- `RPUSH` / `RPOP` → work on Right side
- Accessing middle elements is slow (O(N))

---

### 3. Main Use Cases

| Use Case              | Description                              | Common Pattern              |
|-----------------------|------------------------------------------|-----------------------------|
| **Queues**            | Task/job queues                          | `LPUSH` + `BRPOP`           |
| **Recent Activity**   | Latest notifications / logs              | `LPUSH` + `LTRIM`           |
| **Feeds**             | Activity feeds, news feeds               | `LPUSH` + `LRANGE`          |
| **Stacks**            | LIFO behavior                            | `LPUSH` + `LPOP`            |
| **Timeline**          | Latest posts                             | `LPUSH` + `LRANGE`          |
| **Message Queue**     | Simple producer-consumer                 | Blocking operations         |

---

### 4. Complete Cheat Sheet (List Commands)

#### Basic Commands

| Command                        | Description                              | ioredis Example |
|--------------------------------|------------------------------------------|-----------------|
| `LPUSH key value1 value2`      | Add to Left (Head)                       | `await redis.lpush('queue', 'job1')` |
| `RPUSH key value1 value2`      | Add to Right (Tail)                      | `await redis.rpush('queue', 'job1')` |
| `LPOP key`                     | Remove & return from Left                | `await redis.lpop('queue')` |
| `RPOP key`                     | Remove & return from Right               | `await redis.rpop('queue')` |
| `LRANGE key start stop`        | Get range of elements                    | `await redis.lrange('feed', 0, 9)` |
| `LLEN key`                     | Get length of list                       | `await redis.llen('queue')` |
| `LINDEX key index`             | Get element by index                     | `await redis.lindex('feed', 0)` |
| `LSET key index value`         | Update element at index                  | `await redis.lset('feed', 0, 'new')` |
| `LTRIM key start stop`         | Keep only a range (very useful)          | `await redis.ltrim('feed', 0, 99)` |
| `LREM key count value`         | Remove elements                          | `await redis.lrem('queue', 0, 'job1')` |
| `LMOVE source dest where where`| Atomically move element                  | - |

---

### 5. Blocking Operations (Very Important)

These commands make the client **wait** until data is available.  
Perfect for queues and real-time systems.

| Command                  | Description                                      | Timeout |
|--------------------------|--------------------------------------------------|-------|
| `BLPOP key timeout`      | Blocking LPOP (waits for Left side)              | seconds |
| `BRPOP key timeout`      | Blocking RPOP (waits for Right side)             | seconds |
| `BLMOVE source dest left/right left/right timeout` | Blocking LMOVE | seconds |
| `BRPOPLPUSH source dest timeout` | Old version of reliable queue       | seconds |

**Example (Worker waiting for jobs):**

```js
// Worker process
async function processJobs() {
  while (true) {
    // Wait maximum 5 seconds for a new job
    const result = await redis.brpop('job:queue', 5);

    if (result) {
      const [key, job] = result;
      console.log('Processing job:', job);
      // process the job...
    } else {
      console.log('No job found, waiting again...');
    }
  }
}
```

---

### 6. Common Patterns

#### A. Simple Queue (FIFO)
```js
// Producer
await redis.lpush('job:queue', JSON.stringify(job));

// Consumer
const job = await redis.brpop('job:queue', 0); // 0 = wait forever
```

#### B. Recent Activity / Feed (Keep only latest 100)
```js
await redis.lpush('user:1001:feed', activity);
await redis.ltrim('user:1001:feed', 0, 99); // keep only latest 100
```

#### C. Stack (LIFO)
```js
await redis.lpush('stack', item);
const item = await redis.lpop('stack');
```

#### D. Reliable Queue (using LMOVE / BRPOPLPUSH)
```js
// Move job from main queue to processing queue
const job = await redis.blmove('job:queue', 'job:processing', 'RIGHT', 'LEFT', 0);
```

---

### 7. Pros & Cons

**Pros:**
- Extremely fast when working on head/tail (O(1))
- Perfect for queues and recent activity
- Blocking operations make worker systems easy
- Supports atomic move between lists

**Cons:**
- Slow access to middle elements (`LINDEX`, `LSET` → O(N))
- Not good for searching specific items
- Can grow very large if you don’t use `LTRIM`

---

### 8. Real-Life Examples

| Platform         | How they use List                              |
|------------------|------------------------------------------------|
| **Twitter / X**  | Home timeline / recent tweets                  |
| **Instagram**    | Activity feed                                  |
| **Uber**         | Task queues for matching drivers               |
| **YouTube**      | Recent watch history                           |
| **E-commerce**   | Recent viewed products                         |
| **Job systems**  | Background job queues (like BullMQ uses Redis) |

---

### 9. Small Project Example (MERN)

**Project: Simple Job Queue System**

```js
// producer.js
async function addJob(jobData) {
  await redis.lpush('email:queue', JSON.stringify(jobData));
  console.log('Job added');
}

// worker.js
async function startWorker() {
  console.log('Worker started...');
  
  while (true) {
    const result = await redis.brpop('email:queue', 0); // wait forever
    
    const [queueName, jobString] = result;
    const job = JSON.parse(jobString);
    
    console.log('Sending email to:', job.email);
    // await sendEmail(job);
  }
}
```

**Recent Activity Example:**

```js
// Add activity
await redis.lpush(`user:${userId}:activity`, JSON.stringify(activity));
await redis.ltrim(`user:${userId}:activity`, 0, 49); // keep latest 50

// Get latest 10 activities
const activities = await redis.lrange(`user:${userId}:activity`, 0, 9);
```

---

### 10. Best Practices

1. Always use `LTRIM` when storing recent activity/feeds.
2. Prefer `BRPOP` / `BLPOP` for workers instead of polling.
3. Use `LMOVE` or `BRPOPLPUSH` for reliable queues.
4. Avoid accessing middle of very long lists.
5. Store JSON strings inside lists for complex data.

---
---

**Redis Data Type: Set**  
Complete Detailed Guide (MERN / Node.js Focus)

### 1. Definition

A **Redis Set** is an **unordered collection of unique strings**.

- No duplicate values allowed.
- Very fast membership testing (`SISMEMBER` is O(1)).
- Supports powerful set operations: Intersection, Union, Difference.

Think of it as a JavaScript `Set` stored in Redis.

---

### 2. Key Characteristics

| Feature              | Description                              |
|----------------------|------------------------------------------|
| Unordered            | No guaranteed order                      |
| Unique members       | Automatically removes duplicates         |
| Fast lookup          | `SISMEMBER` is O(1)                      |
| Set Algebra          | Union, Intersection, Difference          |
| Max members          | Up to 2³² - 1 (billions)                 |

---

### 3. Main Use Cases

| Use Case                    | Example Key                     | Why Set is Perfect                     |
|----------------------------|----------------------------------|----------------------------------------|
| Unique visitors            | `visitors:2026-11-21`           | Automatically unique                   |
| Tags                       | `post:1001:tags`                | Easy add/remove tags                   |
| Followers / Following      | `user:1001:followers`           | Relations                              |
| Mutual friends             | Using `SINTER`                  | Find common connections                |
| Unique IP tracking         | `ips:page:home`                 | Count unique IPs                       |
| Roles / Permissions        | `user:1001:roles`               | Check if user has role                 |
| Random winners / lottery   | `contest:participants`          | `SPOP` or `SRANDMEMBER`                |
| Blacklist / Whitelist      | `blacklist:ips`                 | Fast membership check                  |

---

### 4. Complete Cheat Sheet (Set Commands)

#### Basic Commands

| Command                          | Description                              | ioredis Example |
|----------------------------------|------------------------------------------|-----------------|
| `SADD key member1 member2`       | Add one or more members                  | `await redis.sadd('tags', 'nodejs', 'redis')` |
| `SREM key member1 member2`       | Remove members                           | `await redis.srem('tags', 'redis')` |
| `SISMEMBER key member`           | Check if member exists (returns 1 or 0)  | `await redis.sismember('tags', 'nodejs')` |
| `SMEMBERS key`                   | Get all members                          | `await redis.smembers('tags')` |
| `SCARD key`                      | Get number of members                    | `await redis.scard('tags')` |
| `SPOP key [count]`               | Remove & return random member(s)         | `await redis.spop('participants')` |
| `SRANDMEMBER key [count]`        | Get random member(s) without removing    | `await redis.srandmember('participants', 3)` |
| `SMOVE source dest member`       | Move member from one set to another      | `await redis.smove('set1', 'set2', 'value')` |

#### Set Operations (Very Powerful)

| Command                              | Description                          | Example |
|--------------------------------------|--------------------------------------|-------|
| `SINTER key1 key2`                   | Intersection (common members)        | Common tags / mutual friends |
| `SUNION key1 key2`                   | Union (all unique members)           | All tags used |
| `SDIFF key1 key2`                    | Difference (in key1 but not in key2) | - |
| `SINTERSTORE destination key1 key2`  | Store intersection result            | - |
| `SUNIONSTORE destination key1 key2`  | Store union result                   | - |
| `SDIFFSTORE destination key1 key2`   | Store difference result              | - |

---

### 5. Real-Life Examples

| Platform         | How they use Set                              |
|------------------|-----------------------------------------------|
| **Twitter / X**  | Followers & Following lists                   |
| **Instagram**    | User tags, mutual followers                   |
| **E-commerce**   | Product tags, unique visitors                 |
| **Gaming**       | Players online, unique items collected        |
| **Stack Overflow**| Question tags                               |
| **Booking sites**| Unique users who viewed a property            |

---

### 6. Pros & Cons

**Pros:**
- Extremely fast membership testing (`SISMEMBER`)
- Automatic uniqueness
- Powerful set operations (`SINTER`, `SUNION`, `SDIFF`)
- Great for relations and tagging systems
- Memory efficient for unique collections

**Cons:**
- Unordered (if you need order → use Sorted Set)
- `SMEMBERS` on very large sets is slow (O(N)) — avoid on huge sets
- No field-value pairs (only members)

---

### 7. Small Project Examples (MERN)

#### Example 1: Tags System

```js
// Add tags to a post
await redis.sadd(`post:${postId}:tags`, 'nodejs', 'redis', 'mongodb');

// Get all tags of a post
const tags = await redis.smembers(`post:${postId}:tags`);

// Check if post has a specific tag
const hasRedis = await redis.sismember(`post:${postId}:tags`, 'redis');
```

#### Example 2: Follow System + Mutual Friends

```js
// User 1001 follows User 2002
await redis.sadd(`user:1001:following`, 2002);
await redis.sadd(`user:2002:followers`, 1001);

// Find mutual friends between two users
const mutual = await redis.sinter(
  `user:1001:following`,
  `user:2002:following`
);
```

#### Example 3: Unique Daily Visitors

```js
const today = new Date().toISOString().slice(0, 10); // 2026-11-21
const key = `visitors:${today}`;

await redis.sadd(key, userId);
await redis.expire(key, 60 * 60 * 24 * 7); // keep 7 days

const uniqueVisitors = await redis.scard(key);
```

---

### 8. Best Practices

1. Use Set when you need **uniqueness** + fast membership check.
2. Avoid `SMEMBERS` on very large sets — use `SSCAN` instead.
3. Prefer `SINTER`, `SUNION`, `SDIFF` for relationship queries.
4. Always set TTL on temporary sets (daily visitors, etc.).
5. If you need ordering/scoring → use **Sorted Set** instead.

---
---

**Redis Data Type: Sorted Set (ZSet)**  
Complete Detailed Guide (MERN / Node.js Focus)

### 1. Definition

A **Sorted Set** (also called ZSet) is a collection of **unique members**, where each member is associated with a floating-point number called a **score**.

- Members are **unique**
- Scores can be duplicated
- Automatically ordered by score (from lowest to highest)
- Extremely powerful for rankings and range queries

Think of it as a combination of **Set + Sorting**.

---

### 2. How Sorted Set Works

```
Score          Member
-----------------------
  10.5    →    "Rahul"
  25.0    →    "Amit"
  25.0    →    "Sneha"      ← same score allowed
  40.2    →    "Priya"
  55.0    →    "Karan"
```

- Ordered by score (ascending by default)
- You can query by rank (position) or by score range
- Internally uses a **Skip List + Hash Table** → very fast

---

### 3. Main Use Cases

| Use Case                  | Example Key                     | Why Sorted Set is Best                     |
|---------------------------|----------------------------------|--------------------------------------------|
| **Leaderboards**          | `leaderboard:game1`             | Rank players by score                      |
| **Rankings**              | `trending:posts`                | Rank by likes / views                      |
| **Priority Queues**       | `jobs:priority`                 | Process high priority jobs first           |
| **Time-series data**      | `user:1001:actions`             | Score = timestamp                          |
| **Sliding Window**        | Rate limiting, recent activity  | Remove old entries easily                  |
| **Delayed Tasks**         | `delayed:queue`                 | Score = execute timestamp                  |
| **Autocomplete**          | Search suggestions              | Lexicographical ranking                    |
| **Top N Items**           | Top products, top users         | Very common                                |

---

### 4. Complete Cheat Sheet (Sorted Set Commands)

#### Basic Commands

| Command                              | Description                              | ioredis Example |
|--------------------------------------|------------------------------------------|-----------------|
| `ZADD key score member`              | Add member with score                    | `await redis.zadd('leaderboard', 50, 'Rahul')` |
| `ZADD key score1 member1 score2 member2` | Add multiple                          | `await redis.zadd('lb', 50, 'Rahul', 80, 'Amit')` |
| `ZSCORE key member`                  | Get score of a member                    | `await redis.zscore('leaderboard', 'Rahul')` |
| `ZRANK key member`                   | Get rank (0-based, low to high)          | `await redis.zrank('leaderboard', 'Rahul')` |
| `ZREVRANK key member`                | Get reverse rank (high to low)           | `await redis.zrevrank('leaderboard', 'Rahul')` |
| `ZRANGE key start stop [WITHSCORES]` | Get range by rank (ascending)            | `await redis.zrange('leaderboard', 0, 9, 'WITHSCORES')` |
| `ZREVRANGE key start stop [WITHSCORES]` | Get range by rank (descending)        | `await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES')` |
| `ZRANGEBYSCORE key min max`          | Get by score range                       | `await redis.zrangebyscore('lb', 50, 100)` |
| `ZREVRANGEBYSCORE key max min`       | Reverse score range                      | - |
| `ZREM key member`                    | Remove member                            | `await redis.zrem('leaderboard', 'Rahul')` |
| `ZCARD key`                          | Get total members                        | `await redis.zcard('leaderboard')` |
| `ZCOUNT key min max`                 | Count members in score range             | `await redis.zcount('lb', 50, 100)` |
| `ZINCRBY key increment member`       | Increase score                           | `await redis.zincrby('leaderboard', 10, 'Rahul')` |

#### Advanced Commands

| Command                              | Description                              |
|--------------------------------------|------------------------------------------|
| `ZPOPMIN key [count]`                | Remove & return lowest score members     |
| `ZPOPMAX key [count]`                | Remove & return highest score members    |
| `BZPOPMIN` / `BZPOPMAX`              | Blocking versions                        |
| `ZREMRANGEBYRANK key start stop`     | Remove by rank                           |
| `ZREMRANGEBYSCORE key min max`       | Remove by score                          |
| `ZUNIONSTORE` / `ZINTERSTORE`        | Union / Intersection of sorted sets      |

---

### 5. Real-Life Examples

| Platform         | How they use Sorted Set                        |
|------------------|------------------------------------------------|
| **Games**        | Player leaderboards                            |
| **Twitter / X**  | Trending topics                                |
| **YouTube**      | Most popular videos                            |
| **E-commerce**   | Best-selling products                          |
| **Uber / Ola**   | Nearest drivers (score = distance)             |
| **Stock apps**   | Top gainers / losers                           |
| **Learning apps**| Top students by score                          |

---

### 6. Pros & Cons

**Pros:**
- Extremely powerful for rankings and leaderboards
- Fast range queries (by rank or by score)
- Atomic score increments (`ZINCRBY`)
- Supports both rank-based and score-based access
- Can be used for time-series and delayed queues

**Cons:**
- Slightly higher memory usage than normal Set
- More complex than List or Set
- Overkill for simple unique collections

---

### 7. Small Project Examples (MERN)

#### Example 1: Real-time Leaderboard

```js
// Add or update player score
await redis.zadd('game:leaderboard', 4500, 'player:1001');
await redis.zincrby('game:leaderboard', 150, 'player:1001'); // add 150 points

// Get Top 10 players
const topPlayers = await redis.zrevrange('game:leaderboard', 0, 9, 'WITHSCORES');

// Get rank of a player (1st, 2nd, 3rd...)
const rank = await redis.zrevrank('game:leaderboard', 'player:1001');
console.log(`Rank: ${rank + 1}`);
```

#### Example 2: Trending Posts (by likes)

```js
// Increase likes
await redis.zincrby('trending:posts', 1, 'post:55');

// Get top 20 trending posts
const trending = await redis.zrevrange('trending:posts', 0, 19, 'WITHSCORES');
```

#### Example 3: Delayed Job Queue

```js
// Schedule a job to run after 5 minutes
const executeAt = Date.now() + 5 * 60 * 1000;
await redis.zadd('delayed:jobs', executeAt, JSON.stringify(job));

// Worker: Get jobs that are ready
const now = Date.now();
const jobs = await redis.zrangebyscore('delayed:jobs', 0, now);
```

---

### 8. Best Practices

1. Use **Sorted Set** when ranking or ordering matters.
2. Prefer `ZREVRANGE` for leaderboards (highest score first).
3. Use timestamps as scores for time-based data.
4. Always use `WITHSCORES` when you need the actual score.
5. Clean old data using `ZREMRANGEBYSCORE` (important for sliding windows).
6. For large leaderboards, consider storing only Top N using `ZREMRANGEBYRANK`.

---
---

**Redis Advanced Data Types: Stream + Bitmap + Geo**  
Complete Guide (MERN / Node.js Focus)

---

## 1. Redis Stream

### Definition
A **Stream** is an append-only log data structure (similar to Kafka topics, but lighter).  
It is perfect for **event sourcing**, **message queues**, and **real-time data pipelines**.

Each entry in a Stream has:
- Auto-generated ID (`timestamp-sequence`)
- Field-value pairs (like a small Hash)

### Main Use Cases
- Event sourcing
- Activity feeds
- Chat systems
- Notification systems
- Reliable message queues (with Consumer Groups)
- Sensor / IoT data

### Key Commands Cheat Sheet

| Command | Description | Example |
|-------|-------------|---------|
| `XADD key * field value` | Add new entry | `XADD mystream * user Rahul action login` |
| `XREAD COUNT 10 STREAMS key 0` | Read entries | - |
| `XRANGE key start end` | Get range by ID | - |
| `XLEN key` | Length of stream | - |
| `XDEL key id` | Delete entry | - |
| `XGROUP CREATE key groupid $` | Create Consumer Group | - |
| `XREADGROUP GROUP group consumer STREAMS key >` | Read as consumer group | - |
| `XACK key group id` | Acknowledge message | - |
| `XPENDING key group` | See pending messages | - |
| `XCLAIM` | Claim pending message | - |

### Consumer Groups (Most Important Feature)
Streams support **Consumer Groups** just like Kafka:
- Multiple consumers can share the work
- Messages are delivered to only one consumer in the group
- Pending messages can be claimed if a consumer dies

### Pros & Cons
**Pros:**  
- Persistent & durable  
- Consumer Groups support  
- Perfect for event-driven systems  

**Cons:**  
- Slightly more complex than List  
- Not as feature-rich as Kafka for very large scale  

### Small Example (Node.js)

```js
// Producer
await redis.xadd('user:activity', '*', 'userId', 1001, 'action', 'login');

// Consumer Group Example
await redis.xgroup('CREATE', 'user:activity', 'workers', '$', 'MKSTREAM');

const messages = await redis.xreadgroup(
  'GROUP', 'workers', 'consumer1',
  'COUNT', 10,
  'STREAMS', 'user:activity', '>'
);
```

---

## 2. Bitmap

### Definition
A **Bitmap** is not a real data type — it is a String used as a bit array.  
You can set/get individual bits (0 or 1).

Extremely memory efficient for boolean data.

### Main Use Cases
- Feature flags (per user)
- Daily Active Users (DAU)
- Online/Offline tracking
- Presence systems
- Simple analytics (user performed action or not)

### Key Commands Cheat Sheet

| Command | Description | Example |
|-------|-------------|---------|
| `SETBIT key offset value` | Set bit (0 or 1) | `SETBIT users:2026-11-21 1001 1` |
| `GETBIT key offset` | Get bit | `GETBIT users:2026-11-21 1001` |
| `BITCOUNT key` | Count number of 1s | `BITCOUNT users:2026-11-21` |
| `BITOP AND dest key1 key2` | Bitwise operations | AND, OR, XOR, NOT |
| `BITPOS key bit` | Find first bit position | - |

### Real-Life Example (Daily Active Users)

```js
const today = '2026-11-21';
const userId = 1001;

// Mark user as active today
await redis.setbit(`dau:${today}`, userId, 1);

// Get total active users today
const activeUsers = await redis.bitcount(`dau:${today}`);
```

### Pros & Cons
**Pros:** Extremely memory efficient (1 bit per user)  
**Cons:** Only stores true/false, offset must be integer

---

## 3. Geo (Geospatial)

### Definition
Redis **Geo** allows you to store and query geospatial data (longitude + latitude).  
Internally it uses **Sorted Set**.

### Main Use Cases
- Find nearest drivers / restaurants / stores
- Location-based features
- "People near me"
- Delivery apps
- Ride-sharing apps

### Key Commands Cheat Sheet

| Command | Description | Example |
|-------|-------------|---------|
| `GEOADD key longitude latitude member` | Add location | `GEOADD locations 77.2090 28.6139 "Delhi"` |
| `GEODIST key member1 member2 [unit]` | Distance between two points | `GEODIST locations Delhi Mumbai km` |
| `GEORADIUS key lon lat radius unit` | Find members within radius | Old command |
| `GEOSEARCH` | Modern search command (Recommended) | - |
| `GEOPOS key member` | Get coordinates | - |
| `GEOHASH key member` | Get geohash | - |

### Modern Example (Recommended)

```js
// Add locations
await redis.geoadd('stores', 77.2090, 28.6139, 'Store:Delhi');
await redis.geoadd('stores', 72.8777, 19.0760, 'Store:Mumbai');

// Find stores within 50 km of a point
const nearby = await redis.geosearch(
  'stores',
  'FROMLONLAT', 77.21, 28.61,
  'BYRADIUS', 50, 'km',
  'WITHDIST'
);
```

### Pros & Cons
**Pros:** Very fast geo queries, simple to use  
**Cons:** Limited to basic radius/box queries (not as powerful as dedicated geo databases)

---

### Summary Table

| Data Type   | Best For                          | Memory Efficiency | Complexity |
|-------------|-----------------------------------|-------------------|----------|
| **Stream**  | Events, Queues, Activity feeds   | Medium            | Medium-High |
| **Bitmap**  | Feature flags, DAU, Presence      | Excellent         | Low |
| **Geo**     | Location-based search             | Good              | Low-Medium |

---
---
---
**Redis: Keys, TTL, Memory & Eviction**  
Complete Detailed Explanation (MERN / Node.js Focus)

This is one of the **most important topics** for both real projects and interviews.

---

### 1. Keys in Redis

A **Key** is the unique name used to store a value (String, Hash, List, Set, Sorted Set, etc.).

**Best Practices for Key Naming:**
```bash
user:1001:profile
user:1001:session
product:5001:details
order:2026:items
session:abc123xyz
```

**Good conventions:**
- Use `:` as separator
- Keep keys readable
- Include entity + ID
- Avoid spaces and very long keys

---

### 2. TTL (Time To Live) & Key Expiration

**TTL** means how long a key will live before Redis automatically deletes it.

#### Key Expiration Commands

| Command                  | Description                              | Example |
|--------------------------|------------------------------------------|-------|
| `EXPIRE key seconds`     | Set TTL in seconds                       | `EXPIRE session:123 3600` |
| `PEXPIRE key milliseconds`| Set TTL in milliseconds                 | `PEXPIRE otp:999 300000` |
| `EXPIREAT key timestamp` | Expire at specific Unix timestamp        | - |
| `TTL key`                | Get remaining time in seconds            | Returns -1 (no expire), -2 (key not exist) |
| `PTTL key`               | Get remaining time in milliseconds       | - |
| `PERSIST key`            | Remove expiration                        | Make key permanent |

#### How Expiration Works Internally

Redis uses **two strategies** together:

1. **Passive Expiration**  
   - When you try to access a key, Redis checks if it is expired and deletes it.

2. **Active Expiration**  
   - Redis runs a background job 10 times per second.
   - It randomly samples keys with expire set.
   - Deletes expired ones.

**Note:** Expired keys are not deleted immediately in all cases. That’s why sometimes memory is still used even after TTL.

---

### 3. Memory Management & `maxmemory`

By default, Redis will keep using memory until the server runs out of RAM (dangerous).

You should always set:

```conf
maxmemory 2gb
```

When memory reaches the limit, Redis will follow the **eviction policy** you configured.

---

### 4. Eviction Policies

When `maxmemory` is reached, Redis removes keys according to the policy.

| Policy                  | Behavior                                      | When to Use |
|-------------------------|-----------------------------------------------|-----------|
| `noeviction`            | Returns error on write                        | When data loss is not acceptable |
| `allkeys-lru`           | Removes least recently used keys (any key)    | **Most recommended for cache** |
| `volatile-lru`          | LRU only among keys that have expire set      | When some keys are permanent |
| `allkeys-lfu`           | Removes least frequently used keys            | Good for modern workloads |
| `volatile-lfu`          | LFU only among keys with expire               | - |
| `allkeys-random`        | Removes random keys                           | Rarely used |
| `volatile-random`       | Random among keys with expire                 | - |
| `volatile-ttl`          | Removes keys with shortest remaining TTL      | - |

**Recommended settings for most MERN apps (caching):**
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

---

### 5. Key Scanning (Very Important)

#### Never use `KEYS *` in production!

`KEYS` command blocks Redis completely while scanning all keys.

#### Correct Way: Use Cursor-based scanning

| Command     | Use For                  |
|-------------|--------------------------|
| `SCAN`      | All keys                 |
| `HSCAN`     | Fields inside a Hash     |
| `SSCAN`     | Members of a Set         |
| `ZSCAN`     | Members of a Sorted Set  |

**Example using ioredis:**

```js
// Scan all keys matching pattern
let cursor = '0';
do {
  const result = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
  cursor = result[0];
  const keys = result[1];

  console.log(keys);
} while (cursor !== '0');
```

---

### 6. Idle Time & Object Encoding

Redis provides commands to inspect internal information:

| Command                      | Description |
|-----------------------------|-----------|
| `OBJECT IDLETIME key`       | How many seconds the key was not accessed |
| `OBJECT ENCODING key`       | Internal encoding used (ziplist, hashtable, skiplist, etc.) |
| `OBJECT REFCOUNT key`       | Reference count |
| `OBJECT FREQ key`           | Access frequency (when LFU is enabled) |

**Example:**
```bash
OBJECT IDLETIME user:1001
OBJECT ENCODING user:1001
```

Useful when debugging memory issues or understanding why Redis is using more memory.

---

### 7. Practical Recommendations (MERN Projects)

1. **Always set TTL** on:
   - Sessions
   - Cache data
   - OTPs
   - Temporary tokens

2. Use `allkeys-lru` for caching use cases.

3. Never use `KEYS *` in production code.

4. Monitor memory using:
   ```bash
   INFO memory
   ```

5. Use Redis Insight or `redis-cli` to check big keys and memory usage.

---

### Summary

| Concept              | Key Point |
|----------------------|---------|
| TTL                  | Automatic key deletion after time |
| maxmemory            | Limit RAM usage |
| Eviction Policy      | What to delete when memory is full |
| SCAN                 | Safe way to iterate keys |
| OBJECT IDLETIME      | Check how long key is unused |
| OBJECT ENCODING      | Check internal storage format |

---
---
===
**Redis Keys – In-Depth Explanation**

### 1. What is a Key in Redis?

In Redis, a **Key** is the unique identifier used to store and retrieve a value.

- Every piece of data in Redis is stored as a **Key-Value** pair.
- The **Key** is always a string.
- The **Value** can be any Redis data type (String, Hash, List, Set, Sorted Set, Stream, etc.).

Example:
```bash
SET user:1001 "Rahul"
```
- Key → `user:1001`
- Value → `"Rahul"`

---

### 2. Important Characteristics of Redis Keys

| Characteristic              | Details |
|----------------------------|--------|
| **Unique**                 | Keys must be unique within a database |
| **Binary Safe**            | Can contain any binary data (not just text) |
| **Case Sensitive**         | `Name` and `name` are different keys |
| **Maximum Size**           | 512 MB (practically should be much smaller) |
| **No Schema**              | You can create any key dynamically |
| **Namespace Support**      | Commonly use `:` as separator |

---

### 3. Key Naming Best Practices (Very Important)

Good key naming is critical for maintainability and performance.

**Recommended Format:**
```
<object>:<id>:<field>
```

**Good Examples:**
```bash
user:1001
user:1001:profile
user:1001:session
product:5001:details
order:20261121:items
session:abc123xyz
cart:1001
post:55:likes
```

**Bad Examples:**
```bash
u1001
data
temp
user_1001_profile     (harder to scan)
user 1001            (space is allowed but not recommended)
```

**Best Practices:**
- Use `:` as separator (most common convention)
- Keep keys readable
- Be consistent across the project
- Avoid very long keys (wastes memory)
- Include version if needed → `user:v2:1001`

---

### 4. Important Key Commands

| Command               | Description                              | Example |
|-----------------------|------------------------------------------|-------|
| `SET key value`       | Create or update a key                   | `SET name "Rahul"` |
| `GET key`             | Get value of a key                       | `GET name` |
| `DEL key1 key2`       | Delete one or more keys                  | `DEL name age` |
| `EXISTS key`          | Check if key exists (returns 1 or 0)     | `EXISTS name` |
| `TYPE key`            | Get the data type of the key             | `TYPE user:1001` |
| `RENAME old new`      | Rename a key                             | `RENAME name fullname` |
| `RENAMENX old new`    | Rename only if new key does not exist    | - |
| `RANDOMKEY`           | Get a random key                         | - |
| `DUMP key`            | Serialize value of a key                 | - |
| `RESTORE key`         | Restore serialized value                 | - |
| `TOUCH key`           | Update last access time                  | - |
| `UNLINK key`          | Non-blocking delete (better than DEL)    | Recommended for big keys |

---

### 5. Key Expiration Related Commands

| Command                  | Description |
|--------------------------|-----------|
| `EXPIRE key seconds`     | Set timeout in seconds |
| `PEXPIRE key milliseconds` | Set timeout in ms |
| `EXPIREAT key timestamp` | Expire at Unix timestamp |
| `TTL key`                | Remaining time in seconds |
| `PTTL key`               | Remaining time in milliseconds |
| `PERSIST key`            | Remove expiration |
| `EXPIRETIME key`         | Get absolute expiration timestamp (Redis 7+) |

---

### 6. Multiple Databases in Redis

Redis supports **16 databases** by default (numbered from 0 to 15).

```bash
SELECT 0     # Default database
SELECT 1     # Switch to database 1
MOVE key 1   # Move key to database 1
```

**Important Notes:**
- Databases are **not** fully isolated (especially in Redis Cluster).
- Most companies only use database `0`.
- Redis Cluster supports **only database 0**.

---

### 7. Scanning Keys (Never use KEYS in production)

#### Dangerous Command:
```bash
KEYS *
KEYS user:*
```
- Blocks Redis completely
- Can cause serious performance issues

#### Correct Way: Use `SCAN`

```bash
SCAN 0 MATCH user:* COUNT 100
```

**Node.js Example (ioredis):**
```js
let cursor = '0';

do {
  const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
  cursor = nextCursor;

  for (const key of keys) {
    console.log(key);
  }
} while (cursor !== '0');
```

Related commands:
- `HSCAN` → for Hash
- `SSCAN` → for Set
- `ZSCAN` → for Sorted Set

---

### 8. Big Keys Problem

A **Big Key** means:
- A String larger than 10 KB
- A Hash/List/Set/Sorted Set with tens of thousands of elements

**Problems caused by Big Keys:**
- Slow commands
- Blocking Redis
- High memory usage
- Replication delays

**How to find big keys:**
```bash
redis-cli --bigkeys
```

---

### 9. Useful Diagnostic Commands for Keys

| Command                  | Purpose |
|--------------------------|--------|
| `OBJECT ENCODING key`    | Shows internal encoding |
| `OBJECT IDLETIME key`    | Seconds since last access |
| `OBJECT FREQ key`        | Access frequency (LFU) |
| `MEMORY USAGE key`       | Memory used by key |
| `TYPE key`               | Data type of key |

---

### 10. Common Mistakes with Keys

1. Using `KEYS *` in production
2. Not setting TTL on temporary keys
3. Creating extremely long keys
4. Using inconsistent naming conventions
5. Storing large objects in a single String key
6. Not handling key expiration properly

---

### Summary

- Keys are the foundation of Redis.
- Good naming convention is extremely important.
- Always prefer `SCAN` over `KEYS`.
- Use meaningful and structured key names.
- Monitor big keys regularly.
- Set TTL on temporary data.

---
**TTL (Time To Live) & Key Expiration in Redis**  
In-Depth Explanation

### 1. What is TTL?

**TTL (Time To Live)** is the remaining time (in seconds or milliseconds) before Redis **automatically deletes** a key.

Once the TTL reaches zero, the key is considered **expired** and will be removed.

Example:
```bash
SET session:abc123 "user_data" EX 3600
TTL session:abc123          # Returns something like 3598
```

---

### 2. Why Do We Need Key Expiration?

Common real-world use cases:

- User sessions
- OTP / Verification codes
- Cache data
- Temporary tokens (JWT blacklisting, password reset links)
- Rate limiting windows
- Feature flags with time limit
- Temporary locks

Without expiration, Redis memory will keep growing forever steably.

---

### 3. Key Expiration Commands (Complete List)

| Command                        | Description                                      | Return Value |
|--------------------------------|--------------------------------------------------|--------------|
| `EXPIRE key seconds`           | Set TTL in seconds                               | 1 (success), 0 (key not found) |
| `PEXPIRE key milliseconds`     | Set TTL in milliseconds                          | 1 or 0 |
| `EXPIREAT key unix-timestamp`  | Expire at specific Unix timestamp (seconds)     | 1 or 0 |
| `PEXPIREAT key unix-timestamp` | Expire at Unix timestamp (milliseconds)          | 1 or 0 |
| `TTL key`                      | Get remaining time in **seconds**                | -2 (key not exist), -1 (no expire), >=0 |
| `PTTL key`                     | Get remaining time in **milliseconds**           | -2, -1, or milliseconds |
| `PERSIST key`                  | Remove the expiration (make key permanent)       | 1 or 0 |
| `EXPIRETIME key`               | Get absolute expiration timestamp (Redis 7+)     | Unix timestamp |
| `PEXPIRETIME key`              | Same as above in milliseconds                    | - |

---

### 4. Different Ways to Set Expiration

#### Method 1: While setting the key (Recommended)
```bash
SET session:123 "data" EX 3600          # Expire in 1 hour
SET otp:999 "482913" PX 300000          # Expire in 5 minutes (milliseconds)
SET key "value" EXAT 1732180000         # Expire at specific timestamp
```

#### Method 2: After setting the key
```bash
SET session:123 "data"
EXPIRE session:123 3600
```

#### Method 3: Using SET options (Most flexible)
```bash
SET key "value" EX 60 NX        # Set only if not exists + 60 sec TTL
SET key "value" PX 5000 XX      # Set only if exists + 5 sec TTL
SET key "value" KEEPTTL         # Update value but keep existing TTL
```

---

### 5. How Redis Actually Expires Keys (Internal Mechanism)

Redis uses **two combined strategies**:

### A. Passive Expiration (Lazy)
- When a client tries to access a key (`GET`, `HGET`, etc.), Redis checks if it is expired.
- If expired → Redis deletes it and returns `nil`.

### B. Active Expiration (Background)
- Redis runs an active expiration job **10 times per second**.
- It randomly samples keys that have an expiration set.
- Deletes the expired ones.
- If more than 25% of sampled keys are expired, it runs the cycle again immediately.

**Important Point:**  
Expired keys are **not always deleted immediately**. There can be a slight delay (especially under low traffic).

---

### 6. Special Behaviors & Edge Cases

| Situation                              | Behavior |
|----------------------------------------|---------|
| Key is expired but not yet deleted     | Still occupies memory until active/passive cleanup |
| You `SET` a new value on expired key   | New value is stored, old TTL is removed |
| `RENAME` a key                         | TTL is preserved |
| `RENAMENX`                             | TTL is preserved |
| Persist the key (`PERSIST`)            | TTL is removed |
| Redis restart                          | TTL is preserved (if using RDB or AOF) |
| `MOVE` key to another DB               | TTL is preserved |

---

### 7. TTL with Different Data Types

TTL works on the **entire key**, not on individual elements (except Hash fields in Redis 7.4+).

Examples:
- You can set TTL on a Hash, List, Set, Sorted Set, Stream, etc.
- In older Redis versions → You **cannot** expire individual hash fields.
- From **Redis 7.4+** → Support for field-level expiration (`HEXPIRE`, `HPEXPIRE`, etc.)

---

### 8. Best Practices

1. **Always set TTL** on temporary data (sessions, cache, OTPs).
2. Prefer setting expiration **at the time of SET** (`SET key value EX 60`).
3. Use **milliseconds** (`PX`) when you need more precision.
4. For cache, commonly used TTLs:
   - Short-lived cache → 30 seconds to 5 minutes
   - Medium → 10–60 minutes
   - Long → few hours
5. Monitor keys without expiration (they can cause memory issues).
6. Avoid very short TTLs (like 1 second) for high-traffic keys (increases CPU usage due to expiration).

---

### 9. Node.js (ioredis) Examples

```js
// Set key with 1 hour expiration
await redis.set('session:abc123', 'user_data', 'EX', 3600);

// Set with milliseconds
await redis.set('otp:98765', '482913', 'PX', 300000);

// Check remaining time
const ttl = await redis.ttl('session:abc123');
console.log(ttl); // e.g. 3590

// Remove expiration
await redis.persist('session:abc123');

// Set expiration later
await redis.expire('user:1001:cache', 600);
```

---

### 10. Common Interview Questions on TTL

1. What happens when a key expires?
2. Difference between passive and active expiration?
3. What does `TTL` return if the key has no expiration?
4. Does expiration work across Redis restart?
5. Can we set different TTL for different fields in a Hash?
6. Why sometimes expired keys still show up in memory?

---
**Redis Memory Management – Complete In-Depth Guide**

This is one of the most important topics for production Redis and interviews.

---

### 1. `maxmemory` Configuration

By default, Redis has **no memory limit**. It will keep consuming RAM until the server runs out of memory (which can crash the server).

You should **always** set a memory limit:

```conf
maxmemory 2gb
```

or in bytes:
```conf
maxmemory 2147483648
```

You can also set it at runtime:
```bash
CONFIG SET maxmemory 2gb
```

**Best Practice:**  
Set `maxmemory` to around **70-80%** of the total available RAM on the server (leave space for OS, Redis overhead, and fragmentation).

---

### 2. What Happens When Memory is Full?

When Redis reaches the `maxmemory` limit:

1. Redis checks the configured **eviction policy**.
2. According to the policy, it tries to remove keys to free memory.
3. If it cannot free enough memory (depending on policy), it starts **rejecting write commands** with an error:
   ```
   OOM command not allowed when used memory > 'maxmemory'
   ```

Read commands (`GET`, `HGET`, etc.) still work even when memory is full.

---

### 3. Eviction Policies (Detailed Explanation)

You configure the policy using:

```conf
maxmemory-policy allkeys-lru
```

Here are all the policies:

| Policy              | Behavior                                                                 | When to Use                                      | Recommended? |
|---------------------|--------------------------------------------------------------------------|--------------------------------------------------|--------------|
| **noeviction**      | Never deletes keys. Returns error on write when memory is full.          | When data loss is unacceptable (e.g. primary DB) | Only in special cases |
| **allkeys-lru**     | Removes the **Least Recently Used** keys (from all keys)                 | **Best for caching**                             | **Yes (Most Popular)** |
| **volatile-lru**    | LRU only among keys that have an **expire** set                          | When some keys are permanent                     | Good |
| **allkeys-lfu**     | Removes **Least Frequently Used** keys (from all keys)                   | Modern alternative to LRU                        | Very Good |
| **volatile-lfu**    | LFU only among keys with expire                                          | -                                                | Good |
| **allkeys-random**  | Deletes random keys                                                      | Rarely useful                                    | No |
| **volatile-random** | Deletes random keys (only with expire)                                   | Rarely useful                                    | No |
| **volatile-ttl**    | Removes keys with the **shortest remaining TTL**                         | When you want keys that will expire soonest to go first | Situational |

#### Which Policy Should You Choose?

| Use Case                        | Recommended Policy      |
|--------------------------------|-------------------------|
| Redis as Cache                 | `allkeys-lru` or `allkeys-lfu` |
| Mixed (some permanent keys)    | `volatile-lru` or `volatile-lfu` |
| Redis as Primary Database      | `noeviction` |
| Temporary data only            | `volatile-ttl` |

**Current Best Recommendation (2025–2026):**
- Most companies use → `allkeys-lru`
- Many are moving to → `allkeys-lfu` (better in some workloads)

---

### 4. LRU vs LFU

| Algorithm | Full Form                  | Meaning                                      | Best For |
|---------|----------------------------|----------------------------------------------|--------|
| **LRU** | Least Recently Used        | Removes keys that haven’t been used for the longest time | General caching |
| **LFU** | Least Frequently Used      | Removes keys that are used least often       | When some keys are accessed very frequently |

Redis approximates both LRU and LFU (it doesn’t use perfect implementations for performance reasons).

---

### 5. Memory Optimization Techniques

Here are practical ways to reduce Redis memory usage:

1. **Use appropriate data types**
   - Use Hash instead of many Strings for objects
   - Use Bitmap for boolean data
   - Use HyperLogLog for unique counts

2. **Enable compression for small values** (especially Hashes & Sorted Sets)
   - Redis automatically uses `listpack` / `ziplist` for small hashes

3. **Set shorter TTLs** where possible

4. **Avoid storing large objects**
   - Don’t store big JSON blobs if you only need a few fields

5. **Use `HASH` with good field design**

6. **Remove unnecessary keys regularly**

7. **Use Redis 7+ features** (better memory efficiency)

8. **Monitor memory fragmentation**
   ```bash
   INFO memory
   ```
   Look for `mem_fragmentation_ratio`

9. **Use `MEMORY PURGE`** (Redis 4+) to release free memory back to OS (in some cases)

---

### 6. Big Keys Problem

### What is a Big Key?

A key is considered "big" when:
- A **String** is larger than 10 KB
- A **Hash / List / Set / Sorted Set** has tens of thousands of elements
- Or the key consumes a large amount of memory

### Problems Caused by Big Keys

- Commands become slow (`HGETALL`, `SMEMBERS`, `LRANGE`, etc.)
- Redis main thread gets blocked
- Replication becomes slow
- High memory usage
- Risk of eviction of important keys

---

### 7. How to Detect Big Keys

#### Method 1: Using redis-cli (Best)
```bash
redis-cli --bigkeys
```

#### Method 2: Using MEMORY USAGE
```bash
MEMORY USAGE user:1001
```

#### Method 3: Using redis-cli --memkeys (more detailed)
```bash
redis-cli --memkeys
```

#### Method 4: Redis Insight (GUI tool) – Highly Recommended

---

### 8. How to Handle Big Keys

| Problem                        | Solution |
|-------------------------------|----------|
| Large String                  | Split data or compress |
| Large Hash                    | Split into multiple hashes (`user:1001:profile`, `user:1001:settings`) |
| Large List / Set / ZSet       | Split data + use pagination patterns |
| Need full data occasionally   | Store in MongoDB/S3 + cache only required parts |
| Temporary big data            | Set short TTL |

**Best Practice:**  
Design your data so that no single key becomes too large.

---

### Summary

| Topic                  | Key Takeaway |
|------------------------|------------|
| `maxmemory`            | Always set it |
| Best Eviction Policy   | `allkeys-lru` or `allkeys-lfu` |
| When memory is full    | Redis starts evicting keys or rejects writes |
| Big Keys               | Dangerous — detect and split them |
| Optimization           | Use correct data types + TTLs |

---
---

**Redis Pub/Sub Messaging**  
Complete In-Depth Explanation (MERN / Node.js Focus)

### 1. Definition

**Pub/Sub** (Publish/Subscribe) is Redis’s built-in messaging system that allows **one-to-many** real-time communication.

- **Publisher** → sends a message to a **channel**
- **Subscriber** → listens to one or more channels and receives messages instantly

It is completely **fire-and-forget**.  
Redis does **not** store messages. If no one is subscribed at the moment a message is published, the message is **lost forever**.

---

### 2. Architecture Diagram

```
Publisher (Node.js)                  Redis Server                   Subscribers
     |                                    |                              |
     |  PUBLISH "notifications" "Hello"   |                              |
     | --------------------------------→  |                              |
     |                                    |  Message delivered instantly |
     |                                    | ----------------------------→ Subscriber 1
     |                                    | ----------------------------→ Subscriber 2
     |                                    | ----------------------------→ Subscriber 3
     |                                    |                              |
```

- Channels are just **string names** (e.g. `notifications`, `chat:room:101`, `user:1001:updates`)
- Multiple subscribers can listen to the same channel
- One publisher can send to many subscribers at once (message broadcasting)

---

### 3. Core Commands Cheat Sheet

| Command                  | Description                                      | Example |
|--------------------------|--------------------------------------------------|-------|
| `PUBLISH channel message`| Send a message to a channel                      | `PUBLISH notifications "New order received"` |
| `SUBSCRIBE channel1 channel2` | Subscribe to one or more channels            | `SUBSCRIBE notifications chat:general` |
| `PSUBSCRIBE pattern`     | Subscribe using pattern (wildcard)               | `PSUBSCRIBE chat:*` or `user:*:updates` |
| `UNSUBSCRIBE [channel]`  | Unsubscribe from channels                        | `UNSUBSCRIBE notifications` |
| `PUNSUBSCRIBE [pattern]` | Unsubscribe from patterns                        | `PUNSUBSCRIBE chat:*` |
| `PUBSUB CHANNELS`        | List active channels                             | - |
| `PUBSUB NUMSUB channel`  | Number of subscribers on a channel               | - |
| `PUBSUB NUMPAT`          | Number of pattern subscriptions                  | - |

---

### 4. Pattern Subscriptions (`PSUBSCRIBE`)

You can subscribe to multiple channels using wildcards:

| Pattern       | Matches                                      |
|---------------|----------------------------------------------|
| `chat:*`      | `chat:general`, `chat:room:101`, `chat:support` |
| `user:*:updates` | `user:1001:updates`, `user:2002:updates`   |
| `*`           | All channels                                 |
| `news.*`      | `news.sports`, `news.tech`                   |

**Example:**
```bash
PSUBSCRIBE chat:*
```
Now this subscriber will receive messages from **every** channel that starts with `chat:`.

---

### 5. Message Broadcasting

When you do:
```bash
PUBLISH notifications "Server maintenance at 12 AM"
```

**Every** client currently subscribed to the `notifications` channel receives the message **instantly**.

This is true broadcasting — one publish → many receivers.

---

### 6. Node.js (ioredis) Examples

#### Publisher
```js
const Redis = require('ioredis');
const redis = new Redis();

await redis.publish('notifications', JSON.stringify({
  title: 'New Order',
  message: 'Order #1234 placed',
  time: Date.now()
}));
```

#### Subscriber
```js
const Redis = require('ioredis');
const subscriber = new Redis();

// Subscribe to specific channel
await subscriber.subscribe('notifications');

subscriber.on('message', (channel, message) => {
  console.log(`Received from ${channel}:`, message);
  const data = JSON.parse(message);
  // send to frontend via Socket.io, etc.
});
```

#### Pattern Subscription
```js
await subscriber.psubscribe('user:*:notifications');

subscriber.on('pmessage', (pattern, channel, message) => {
  console.log(`Pattern: ${pattern} | Channel: ${channel} | Message: ${message}`);
});
```

**Important:**  
In ioredis, once a connection is used for `SUBSCRIBE` or `PSUBSCRIBE`, it enters **subscriber mode** and can only run subscription-related commands. You normally create a **separate Redis connection** for publishing.

---

### 7. Pub/Sub Limitations (Very Important)

| Limitation                        | Explanation |
|-----------------------------------|-----------|
| **No Persistence**                | Messages are not stored. If subscriber is offline → message is lost |
| **No Message History**            | New subscribers cannot see old messages |
| **No Guaranteed Delivery**        | At-most-once delivery |
| **No Acknowledgments**            | Publisher doesn’t know if anyone received the message |
| **No Consumer Groups**            | Cannot distribute messages among multiple workers easily |
| **Blocking Connection**           | Subscriber connection cannot run normal commands |
| **Not suitable for reliable queues** | Use Streams or external brokers instead |

---

### 8. Pub/Sub vs Streams (Comparison)

| Feature                  | Pub/Sub                          | Streams                              |
|--------------------------|----------------------------------|--------------------------------------|
| Persistence              | No                               | Yes (append-only log)                |
| Message History          | No                               | Yes                                  |
| Offline Consumers        | Messages lost                    | Messages wait                        |
| Consumer Groups          | No                               | Yes                                  |
| Acknowledgments          | No                               | Yes (`XACK`)                         |
| Ordering                 | Best-effort                      | Guaranteed                           |
| Use Case                 | Real-time fire-and-forget        | Reliable event processing / queues   |
| Complexity               | Very simple                      | Medium                               |

**Rule of Thumb:**
- Need **real-time + can afford message loss** → Pub/Sub
- Need **reliability + history + multiple consumers** → Streams

---

### 9. Real-Life Use Cases

| Use Case                        | Example |
|--------------------------------|---------|
| **Real-time Notifications**    | Order status, new message alerts, system alerts |
| **Chat Applications**          | Room-based chat, private messages |
| **Live Updates**               | Live scores, stock prices, auction bids |
| **Presence System**            | User online/offline status |
| **Live Dashboards**            | Real-time analytics push |
| **Collaborative Apps**         | Multiple users editing the same document |
| **Breaking News / Alerts**     | Push notifications to many users |

**Companies using it:**  
Many chat systems, notification services, live sports apps, collaborative tools, etc.

---

### 10. Small Project Example (MERN)

**Real-time Notification System**

```js
// publisher (when new order is created)
app.post('/order', async (req, res) => {
  // ... save order to MongoDB

  await redis.publish('notifications', JSON.stringify({
    type: 'NEW_ORDER',
    orderId: order._id,
    userId: order.userId,
    message: 'Your order has been placed!'
  }));

  res.json({ success: true });
});

// subscriber (usually in a separate process or with Socket.io)
const subscriber = new Redis();
subscriber.subscribe('notifications');

subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  
  // Send to specific user via Socket.io
  io.to(data.userId).emit('notification', data);
});
```

---

### 11. Best Practices

1. Use meaningful channel names → `user:1001:notifications`, `chat:room:55`
2. Always create a **separate Redis connection** for subscribers
3. Prefer **Streams** when you need reliability
4. Don’t use Pub/Sub for critical data that must not be lost
5. Combine with Socket.io / WebSockets on the frontend for real-time browser updates
6. Use patterns (`PSUBSCRIBE`) carefully — too broad patterns can overwhelm subscribers

---

### Summary

Redis Pub/Sub is excellent for **simple, real-time, fire-and-forget** messaging such as notifications, chat, and live updates.  
It is extremely fast and easy to use, but it has serious limitations around persistence and reliability — that’s why **Streams** were introduced as a more powerful alternative.

---
**Complete Caching Concepts Guide** (Redis + MERN Focus)

Here’s a clear and detailed explanation of every concept you listed.

---

### 1. What is Caching?

**Caching** means storing frequently used data in a fast storage layer (like Redis) so that future requests can be served much faster instead of querying the slower primary database (MongoDB) every time.

**Goal:** Reduce database load + improve response time.

---

### 2. Cache Hit vs Cache Miss

| Term          | Meaning                                      | Result                  |
|---------------|----------------------------------------------|-------------------------|
| **Cache Hit** | Requested data is found in the cache         | Very fast response      |
| **Cache Miss**| Requested data is **not** found in the cache | Must go to database     |

**Hit Ratio** = Hits / (Hits + Misses)  
Higher hit ratio = better caching performance.

---

### 3. Cache Invalidation

**Cache Invalidation** means removing or updating outdated data in the cache so users don’t receive stale information.

**Common strategies:**
- Delete the key when data is updated (`DEL user:1001`)
- Update the cache with new data
- Use short TTL so data expires automatically
- Event-based invalidation (when MongoDB document changes)

**Famous quote:**  
> “There are only two hard things in Computer Science: cache invalidation and naming things.”

---

### 4. Caching Patterns

#### A. Cache-Aside Pattern (Lazy Loading) – Most Common
- Application is responsible for reading and writing the cache.
- On read → Check cache → If miss, load from DB → Store in cache.
- On write → Update DB → Delete/invalidate cache.

**Best for:** Most MERN applications.

#### B. Read-Through Caching
- Application only talks to the cache.
- On miss, the **cache itself** loads data from the database.

#### C. Write-Through Caching
- Application writes to the cache.
- Cache **synchronously** writes to the database.
- Ensures cache and DB are always consistent.
- Slightly slower writes.

#### D. Write-Behind (Write-Back) Caching
- Application writes only to the cache.
- Cache writes to the database **asynchronously** later.
- Extremely fast writes.
- Risk of data loss if cache crashes before flushing.

#### E. Write-Around Caching
- Application writes **directly to the database**.
- Cache is only populated on read (Cache-Aside style).
- Avoids filling the cache with data that might not be read again soon.

---

### 5. TTL-based Caching

**TTL (Time To Live)** automatically deletes a key after a set time.

```js
await redis.set('user:1001', JSON.stringify(user), 'EX', 600); // 10 minutes
```

**Benefits:**
- Prevents stale data forever
- Automatically frees memory
- Simple way to handle invalidation

**Best Practice:** Add random jitter to TTL to avoid many keys expiring at the same time.

---

### 6. Cache Warming

**Cache Warming** means pre-loading important data into the cache **before** users request it.

**Examples:**
- Load top 100 products when the server starts
- Pre-cache popular user profiles
- Warm cache after deployment

Helps avoid cache misses during peak traffic.

---

### 7. Major Caching Problems

#### A. Cache Stampede (Thundering Herd)
Many requests for the same expired key hit the database at the same time.

**Solutions:**
- Use distributed lock (only one request rebuilds the cache)
- Probabilistic early expiration
- Background refresh

#### B. Cache Penetration
Requests for data that **never exists** in the database (attackers can exploit this).

**Solutions:**
- Cache empty/null results (Negative Caching)
- Use Bloom Filter
- Validate input

#### C. Cache Avalanche
Many keys expire at the **same moment** → sudden massive load on the database.

**Solutions:**
- Add random TTL jitter
- High availability Redis setup
- Circuit breaker

#### D. Negative Caching
Caching the fact that data **does not exist**.

```js
if (!user) {
  await redis.set(`user:${id}`, 'null', 'EX', 60);
}
```

Prevents repeated database queries for non-existent data.

---

### 8. Cache Eviction Policies

When Redis reaches `maxmemory`, it starts removing keys according to the configured policy.

#### Maxmemory Configuration
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

You should **always** set `maxmemory` in production.

---

### 9. Eviction Algorithms

| Policy              | Full Form                     | How it Works                              | Best For |
|---------------------|-------------------------------|-------------------------------------------|----------|
| **LRU**             | Least Recently Used           | Removes keys that haven’t been used for the longest time | General caching (most popular) |
| **LFU**             | Least Frequently Used         | Removes keys that are used least often    | When some keys are extremely popular |
| **FIFO**            | First In First Out            | Removes the oldest inserted keys          | Rarely used |
| **Random**          | -                             | Deletes random keys                       | Simple but not smart |
| **TTL-based**       | volatile-ttl                  | Removes keys with shortest remaining TTL  | When using expiration |

**Recommended for most MERN apps:**
```conf
maxmemory-policy allkeys-lru
```
or
```conf
maxmemory-policy allkeys-lfu
```

- `allkeys-*` → Can remove any key
- `volatile-*` → Only removes keys that have a TTL set

---

### Quick Summary Table

| Concept              | One-line Meaning |
|----------------------|------------------|
| Caching              | Store data in fast memory for quicker access |
| Cache Hit / Miss     | Found vs Not Found in cache |
| Cache Invalidation   | Removing/updating old data |
| Cache-Aside          | App manages the cache (most common) |
| Write-Through        | Write to cache + DB at the same time |
| Write-Behind         | Write to cache first, DB later |
| TTL                  | Auto-expire keys |
| Cache Warming        | Pre-load important data |
| Stampede             | Many requests rebuild same key |
| Penetration          | Queries for non-existent data |
| Avalanche            | Many keys expire together |
| Negative Caching     | Cache “not found” results |
| LRU / LFU            | Smart ways to remove old data when memory is full |

---
**Redis Caching Patterns**  
Complete In-Depth Guide (MERN / Node.js Focus)

Caching is one of the most common and important uses of Redis. Choosing the right pattern (and handling the common problems) is a frequent interview topic and critical for real projects.

---

### 1. Main Caching Patterns

| Pattern              | How it Works                                      | Who is Responsible | Best For |
|----------------------|---------------------------------------------------|--------------------|----------|
| **Cache-Aside** (Lazy Loading) | Application checks cache first. On miss → load from DB → store in cache | Application        | Most common, general purpose |
| **Read-Through**     | Application always talks to cache. Cache loads data from DB on miss | Cache library/layer | Simplified application code |
| **Write-Through**    | Application writes to cache → cache writes to DB synchronously | Cache layer        | Strong consistency needed |
| **Write-Behind** (Write-Back) | Application writes to cache → cache writes to DB asynchronously later | Cache layer        | High write performance |
| **Refresh-Ahead**    | Cache proactively refreshes data before it expires | Cache layer        | Predictable access patterns |

---

### 2. Cache-Aside (Lazy Loading) – Most Popular

**Flow:**
1. Application receives request
2. Check Redis
3. **Cache Hit** → return data
4. **Cache Miss** → query MongoDB → store result in Redis (with TTL) → return data

**Node.js Example:**

```js
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // 1. Try cache
  let user = await redis.get(cacheKey);
  if (user) {
    console.log('Cache HIT');
    return JSON.parse(user);
  }

  console.log('Cache MISS');

  // 2. Get from MongoDB
  user = await User.findById(userId);
  if (!user) return null;

  // 3. Store in Redis
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 600); // 10 minutes

  return user;
}
```

**Pros:**
- Simple to implement
- Only requested data is cached
- Cache and DB can evolve independently

**Cons:**
- First request is always slow (cache miss)
- Possible data inconsistency if DB is updated but cache is not invalidated

---

### 3. Write-Through

**Flow:**
- Application writes to the cache
- Cache **synchronously** writes to the database
- Then returns success

**Pros:** Data in cache and DB is always consistent  
**Cons:** Higher write latency (must wait for DB)

---

### 4. Write-Behind (Write-Back)

**Flow:**
- Application writes only to Redis
- Redis acknowledges immediately
- A background process later writes the data to MongoDB

**Pros:** Extremely fast writes  
**Cons:** Risk of data loss if Redis crashes before writing to DB  
**Use case:** High-write systems (likes, views, analytics) where eventual consistency is acceptable

---

### 5. Refresh-Ahead

The cache proactively refreshes data **before** it expires, based on predicted access patterns.

Useful when you know certain keys will be accessed soon (e.g., popular products).

---

### 6. Common Caching Problems & Solutions

These are **very frequently asked** in interviews.

#### A. Cache Penetration
**Problem:** Requests for data that does **not exist** in DB (and therefore never gets cached). Attackers can flood your DB.

**Solutions:**
- Cache null / empty results with short TTL
- Bloom Filter (check if key might exist before querying DB)
- Input validation

```js
if (!user) {
  await redis.set(cacheKey, 'null', 'EX', 60); // cache the miss
  return null;
}
```

#### B. Cache Breakdown (Hot Key Problem)
**Problem:** A very popular key expires → many requests hit the database at the same time.

**Solutions:**
- Use mutex / distributed lock when rebuilding the cache
- Set logical expiration + random extra TTL
- Keep hot keys permanently (or with very long TTL)

#### C. Cache Avalanche
**Problem:** Many keys expire at the **same time** → sudden heavy load on DB.

**Solutions:**
- Add random jitter to TTL (`EX 600 + Math.floor(Math.random() * 60)`)
- Use high availability Redis (Sentinel / Cluster)
- Circuit breaker pattern

#### D. Cache Stampede / Thundering Herd
**Problem:** Many concurrent requests for the same expired key all try to rebuild the cache.

**Best Solutions:**
1. **Distributed Lock** (only one request rebuilds the cache)
2. **Probabilistic Early Expiration**
3. Background refresh

**Locking Example (recommended):**

```js
async function getUserWithLock(userId) {
  const cacheKey = `user:${userId}`;
  let user = await redis.get(cacheKey);

  if (user) return JSON.parse(user);

  const lockKey = `lock:user:${userId}`;
  const locked = await redis.set(lockKey, '1', 'EX', 10, 'NX');

  if (locked) {
    try {
      user = await User.findById(userId);
      await redis.set(cacheKey, JSON.stringify(user), 'EX', 600);
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // Wait a bit and retry
    await new Promise(r => setTimeout(r, 50));
    return getUserWithLock(userId);
  }

  return user;
}
```

---

### 7. Best Practices for Caching in MERN

1. Always set a **TTL** (never cache forever unless necessary).
2. Prefer **Cache-Aside** for most applications.
3. Use meaningful key names: `user:1001:profile`
4. Add **random jitter** to TTL to prevent avalanche.
5. Cache null values for a short time to prevent penetration.
6. Invalidate cache properly on updates (or use short TTL).
7. Monitor hit ratio (`INFO stats` → `keyspace_hits` / `keyspace_misses`).
8. Avoid caching large objects or data that changes very frequently.

---

### 8. Small Project Example (Cache-Aside + Stampede Protection)

You can combine the earlier page-views example with locking for production safety.

---

### Summary

| Pattern / Problem       | Recommendation                          |
|-------------------------|-----------------------------------------|
| General Caching         | Cache-Aside                             |
| Strong consistency      | Write-Through                           |
| High write performance  | Write-Behind (with care)                |
| Hot Key / Stampede      | Distributed Lock + single rebuild       |
| Penetration             | Cache null + Bloom Filter               |
| Avalanche               | Random TTL jitter                       |

---

**Redis Distributed Systems + Streams – In-Depth Explanation**  
(MERN / Node.js Focus)

This covers two important areas: **Distributed Systems patterns** using Redis and a deeper look at **Redis Streams**.

---

## Part 1: Distributed Systems with Redis

### 1. Distributed Locks

A **distributed lock** ensures that only one process/instance across multiple servers can execute a critical section at a time (e.g., updating inventory, processing a payment, generating a report).

#### Simple & Recommended Way (Single Redis Instance)

```js
const lockKey = 'lock:order:1001';
const lockValue = uuidv4(); // unique value per client
const ttl = 30; // seconds

// Acquire lock
const result = await redis.set(lockKey, lockValue, 'EX', ttl, 'NX');

if (result === 'OK') {
  try {
    // Critical section
    await processOrder();
  } finally {
    // Safe release using Lua (important!)
    const unlockScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(unlockScript, 1, lockKey, lockValue);
  }
} else {
  // Lock already held
}
```

**Why unique value + Lua?**  
Prevents one client from deleting another client’s lock after its own lock expired.

#### Problems with Single-Instance Lock
- If Redis master fails and a replica is promoted **before** the lock is replicated → two clients can hold the lock.
- Process pause (GC) longer than TTL → lock expires while work is still running.

---

### 2. Redlock Algorithm

**Redlock** (proposed by Redis creator antirez) is designed for higher fault tolerance.

**How it works:**
1. Use **N independent Redis masters** (usually 5, no replication between them).
2. Client tries to acquire the same lock (same key + unique value + TTL) on all N instances.
3. Lock is considered acquired only if:
   - It succeeds on a **majority** (e.g., 3 out of 5)
   - Total time taken < lock TTL
4. Effective validity time = original TTL – time spent acquiring.
5. To release → delete the key on **all** instances.

**Pros:**
- Survives failure of a minority of nodes
- Better than single-instance for availability

**Cons / Controversies:**
- Relies on timing assumptions (clocks, network delay, process pauses)
- No built-in **fencing token**
- Criticized by Martin Kleppmann (author of *Designing Data-Intensive Applications*)
- Still not fully safe for strong correctness under long GC pauses or clock jumps

**Practical Advice (2026):**
- Use simple `SET NX EX` + Lua for most cases (efficiency locks).
- Use Redlock only when you need better availability and can tolerate rare dual-holders.
- For **correctness-critical** systems (money, inventory) → prefer ZooKeeper, etcd, or database locks + fencing tokens + idempotency.

---

### 3. Race Conditions

A **race condition** occurs when multiple processes access and modify shared data at the same time, leading to incorrect results.

**Example:**
Two users try to buy the last item in stock at the same moment → both succeed → overselling.

**Solutions with Redis:**
- Distributed locks
- Atomic operations (`INCR`, `DECR`, `HINCRBY`)
- Lua scripts (multi-step logic becomes atomic)
- Optimistic locking with `WATCH` + `MULTI/EXEC`

---

### 4. Concurrency Control

Ways to control concurrent access:

| Method                  | Type          | Redis Feature                  | Best For |
|-------------------------|---------------|--------------------------------|----------|
| Distributed Lock        | Pessimistic   | `SET NX EX` + Lua              | Critical sections |
| Optimistic Locking      | Optimistic    | `WATCH` + Transactions         | Low contention |
| Atomic Commands         | Built-in      | `INCR`, `HINCRBY`, etc.        | Counters |
| Lua Scripts             | Atomic        | `EVAL`                         | Complex logic |
| Streams + Consumer Groups | Coordination | Message ownership            | Work queues |

---

### 5. Idempotency

An operation is **idempotent** if executing it multiple times has the same effect as executing it once.

**Why needed?**  
In distributed systems, messages or requests can be retried (network issues, crashes, at-least-once delivery).

**How to implement with Redis:**
```js
const idempotencyKey = `idempotent:${requestId}`;

const alreadyProcessed = await redis.set(idempotencyKey, '1', 'EX', 86400, 'NX');

if (alreadyProcessed !== 'OK') {
  return; // already done
}

// Process the request safely
```

Very important when using Streams, job queues, or payment systems.

---

### 6. Leaderboards

Best implemented with **Sorted Sets**.

```js
// Update score
await redis.zincrby('leaderboard:game1', 50, 'player:1001');

// Top 10
const top10 = await redis.zrevrange('leaderboard:game1', 0, 9, 'WITHSCORES');

// Rank of a player
const rank = await redis.zrevrank('leaderboard:game1', 'player:1001');
```

---

### 7. Distributed Counters

Simple and atomic:
```js
await redis.incr('page:views:homepage');
await redis.incrby('product:5001:sales', 5);
```

For unique counts → use **HyperLogLog** (`PFADD` / `PFCOUNT`).

For high contention → combine with locks or Lua if needed.

---

### 8. Distributed Rate Limiting

Common algorithms:

| Algorithm          | Redis Data Structure     | Description |
|--------------------|--------------------------|-----------|
| Fixed Window       | String + INCR + TTL      | Simple but allows bursts at window edges |
| Sliding Window Log | Sorted Set (timestamp)   | Accurate but more memory |
| Sliding Window Counter | Hash or String        | Good balance |
| Token Bucket       | String + Lua             | Smooth rate limiting |

**Simple Fixed Window Example:**
```js
const key = `ratelimit:${userId}:${Math.floor(Date.now()/60000)}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);

if (count > 100) {
  // rate limited
}
```

---

## Part 2: Redis Streams (Advanced)

### 1. Consumer Groups

A **Consumer Group** allows multiple consumers to share the work of reading a stream (like Kafka consumer groups).

- Each message is delivered to **only one** consumer in the group.
- Different groups can read the same stream independently.

```js
// Create group (starts from new messages)
await redis.xgroup('CREATE', 'orders', 'processors', '$', 'MKSTREAM');
```

---

### 2. Message Acknowledgment (`XACK`)

When a consumer successfully processes a message, it must **acknowledge** it.

```js
await redis.xack('orders', 'processors', messageId);
```

Until acknowledged, the message stays in the **Pending Entries List (PEL)**.

---

### 3. Pending Messages (PEL)

- Every message delivered via `XREADGROUP` goes into the PEL.
- It stays there until `XACK` is called.
- You can inspect pending messages with `XPENDING`.

```js
const pending = await redis.xpending('orders', 'processors');
```

---

### 4. Message Delivery Semantics

Redis Streams with Consumer Groups provide **at-least-once** delivery.

- A message may be delivered more than once if the consumer crashes before `XACK`.
- True exactly-once requires **idempotency** on the consumer side.

---

### 5. Consumer Recovery

If a consumer dies:

1. Messages stay in PEL.
2. Another consumer can **claim** them using `XCLAIM` or `XAUTOCLAIM`.

```js
// Claim messages idle for more than 60 seconds
const claimed = await redis.xautoclaim(
  'orders', 'processors', 'consumer-2', 60000, '0-0', 'COUNT', 10
);
```

**Best recovery pattern:**
1. On startup → first process your own pending messages (`XREADGROUP` with ID `0`)
2. Then read new messages (`>`)
3. Periodically claim idle pending messages from dead consumers

---

### 6. Event-Driven Architecture with Streams

Streams are excellent for event-driven systems:

- **Producers** → `XADD` events
- **Multiple independent consumers/groups** → process different concerns (email, analytics, inventory, notifications)
- History is retained (until trimmed)
- Supports replay and recovery

**Typical flow:**
```
Order Created → XADD to "orders" stream
     ↓
Consumer Group "inventory" → reduce stock
Consumer Group "email" → send confirmation
Consumer Group "analytics" → update metrics
```

---

### Summary Table

| Concept              | Key Point                                      | Redis Tool |
|----------------------|------------------------------------------------|----------|
| Distributed Lock     | Mutual exclusion across servers                | `SET NX EX` + Lua / Redlock |
| Race Condition       | Concurrent unsafe access                       | Locks / Atomic ops / Lua |
| Idempotency          | Safe to retry                                  | Unique key + `SET NX` |
| Leaderboard          | Rankings                                       | Sorted Set |
| Rate Limiting        | Control request rate                           | INCR + TTL / Sorted Set |
| Streams Delivery     | At-least-once                                  | Consumer Groups + XACK |
| Recovery             | Handle crashed consumers                       | XPENDING + XCLAIM / XAUTOCLAIM |

---
**Redis Security + Performance**  
Complete In-Depth Guide (MERN / Node.js Focus)

---

## Part 1: Redis Security

### 1. Redis Authentication

By default, Redis has **no password** (very dangerous).

**Old way (Redis < 6):**
```conf
requirepass your_strong_password
```

**Client connection:**
```js
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});
```

---

### 2. ACL (Access Control Lists) – Redis 6+

ACL is the modern and recommended way to manage users and permissions.

**Create a user:**
```bash
ACL SETUSER appuser on >strongpassword ~* &* +@all
```

**Common ACL examples:**

| Goal                         | ACL Command Example |
|-----------------------------|---------------------|
| Full access                 | `+@all` |
| Read only                   | `+@read` |
| Only specific commands      | `+get +set +hget +hset` |
| Only specific key patterns  | `~user:* ~session:*` |
| Deny dangerous commands     | `-@dangerous` or `-flushall -keys -config` |

**List users:**
```bash
ACL LIST
ACL WHOAMI
```

---

### 3. User Permissions (Best Practices)

- Never give the default `default` user full access in production.
- Create separate users for different applications.
- Follow **least privilege** principle.
- Disable or rename dangerous commands (`FLUSHALL`, `FLUSHDB`, `KEYS`, `CONFIG`, `SHUTDOWN`, etc.).

---

### 4. TLS Encryption

Encrypt data in transit between your Node.js app and Redis.

**Enable TLS in `redis.conf`:**
```conf
port 0
tls-port 6379
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt
```

**Node.js (ioredis) with TLS:**
```js
const redis = new Redis({
  host: 'your-redis-host',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: true
  }
});
```

---

### 5. Protected Mode

When Redis is started without a password and is bound to all interfaces, **Protected Mode** blocks external connections.

```conf
protected-mode yes   # default
```

Always keep it enabled unless you have proper authentication + firewall.

---

### 6. Network Binding

By default Redis binds to `127.0.0.1` (safer).

```conf
bind 127.0.0.1
```

For remote access (not recommended without security):
```conf
bind 0.0.0.0
```

**Best Practice:** Bind only to private network IPs.

---

### 7. Firewall Configuration

- Allow Redis port (6379 or custom) **only** from your application servers.
- Use cloud security groups / firewall rules.
- Never expose Redis directly to the public internet.

---

### 8. Secure Redis Deployment Checklist

- Set a strong password or use ACL
- Enable TLS
- Bind to private IP only
- Use firewall / security groups
- Disable dangerous commands
- Run Redis as a non-root user
- Keep Redis updated
- Use Redis + Sentinel or Cluster with authentication
- Never commit passwords in code

---

### 9. Environment Variables & Secrets

**Never hardcode secrets.**

```js
// .env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_strong_password
```

```js
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
```

Use tools like AWS Secrets Manager, HashiCorp Vault, or Doppler in production.

---

## Part 2: Redis Performance

### 1. Redis Benchmarking

**Tool:** `redis-benchmark` (comes with Redis)

```bash
redis-benchmark -h 127.0.0.1 -p 6379 -a password -t set,get -n 100000 -q
```

Useful flags:
- `-n` → number of requests
- `-c` → number of clients
- `-P` → pipeline requests
- `-t` → specific commands

---

### 2. SLOWLOG

Shows commands that took longer than a threshold.

```bash
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET
```

Configure threshold:
```conf
slowlog-log-slower-than 10000   # 10ms
```

---

### 3. LATENCY Monitoring

```bash
LATENCY DOCTOR
LATENCY LATEST
LATENCY HISTORY command
LATENCY RESET
```

Helps diagnose sudden latency spikes.

---

### 4. MEMORY Commands

| Command            | Purpose |
|--------------------|--------|
| `MEMORY USAGE key` | Memory used by a specific key |
| `MEMORY DOCTOR`    | Gives advice about memory issues |
| `MEMORY STATS`     | Detailed memory statistics |
| `MEMORY PURGE`     | Attempt to free free memory ( jemalloc ) |

---

### 5. INFO Command

Most important diagnostic command:

```bash
INFO
INFO memory
INFO stats
INFO clients
INFO commandstats
INFO keyspace
```

---

### 6. Big Keys

Large keys cause blocking and high memory usage.

**Find them:**
```bash
redis-cli --bigkeys
redis-cli --memkeys
```

**How to handle:**
- Split big hashes/lists into smaller ones
- Avoid `HGETALL`, `SMEMBERS`, `LRANGE 0 -1` on large collections
- Use pagination or scanning

---

### 7. Hot Keys

Keys that receive extremely high traffic.

**Problems:** Can overload one Redis shard or cause CPU spikes.

**Solutions:**
- Local caching (in Node.js process)
- Replicate hot keys
- Use Redis Cluster carefully
- Add randomness in key names if possible

---

### 8. Connection Pooling

In Node.js, use connection pooling (ioredis does this well by default).

```js
const redis = new Redis({
  host: '127.0.0.1',
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // ioredis manages a pool internally
});
```

Avoid creating a new connection on every request.

---

### 9. Pipelining

Send multiple commands at once without waiting for individual replies → massive performance gain.

```js
const pipeline = redis.pipeline();

pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.get('key1');

const results = await pipeline.exec();
```

---

### 10. Memory Optimization Techniques

- Use Hash for objects instead of many Strings
- Use Bitmap / HyperLogLog when possible
- Set shorter TTLs
- Avoid storing large JSON blobs
- Enable compression where suitable
- Monitor `mem_fragmentation_ratio`
- Use appropriate eviction policy

---

### 11. Eviction Policies (Quick Recap)

```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

| Policy            | Best Use Case |
|-------------------|---------------|
| `allkeys-lru`     | General caching (most recommended) |
| `allkeys-lfu`     | When access frequency matters |
| `volatile-lru`    | Only expire keys that have TTL |
| `noeviction`      | When data loss is unacceptable |

---

### Security + Performance Best Practices Summary

**Security:**
- Use ACL + strong passwords
- Enable TLS
- Never expose Redis publicly
- Least privilege principle

**Performance:**
- Use Pipelining
- Connection pooling
- Monitor with `INFO`, `SLOWLOG`, `LATENCY`
- Avoid big keys and hot keys
- Set proper `maxmemory` + eviction policy
- Prefer efficient data structures

---

## Interview Master Page

### A. Redis in One Architecture Diagram

```text
                         APPLICATIONS
      +------------------+------------------+------------------+
      |   Web API        |  Worker / Queue  |  Live Features   |
      +--------+---------+--------+---------+--------+---------+
               |                  |                  |
               +------------------+------------------+
                                  |
                         Redis client / ioredis
                                  |
                    +-------------v-------------+
                    |      Redis Server         |
                    |  Event loop + RESP        |
                    |  command execution        |
                    |  data structures in RAM   |
                    +------+------+------+-----+
                           |      |      |
                 +---------+      |      +----------+
                 |                |                 |
          Persistence        Replication       Cluster
          RDB / AOF          Replica nodes    Hash slots
                 |                |                 |
          Disk backup     Failover/Sentinel    Data shards
```

Redis Cluster automatically assigns keyspace across 16,384 hash slots. By default, the key name determines the slot; use `{tag}` to force related keys onto the same slot:

```bash
SET 'session:{alice}:profile' '{...}'
SET 'session:{alice}:cart' '[...]'
```

### B. Cache-Aside Request Flow

```text
Client -> API -> cache key?
                    |
            Redis contains it?
              /             \
           YES               NO
            |                 |
       return data      query database
       Cache HIT               |
                              save in Redis with TTL
                              return data
                              Cache MISS
```

Example:

```js
async function getUser(id) {
  const key = `user:${id}:profile`;
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached); // cache hit
  }

  const user = await User.findById(id).lean();
  if (user) {
    await redis.set(key, JSON.stringify(user), 'EX', 300);
  } else {
    await redis.set(key, 'null', 'EX', 30); // negative cache
  }

  return user;
}
```

### C. Choose the Correct Redis Data Structure

| Requirement | Use |
|---|---|
| Simple cache, flag, serialized config, counter | String |
| Object with independently updated fields | Hash |
| FIFO/LIFO queue or recent activity list | List |
| Unique members, tags, followers, intersections | Set |
| Ranking, leaderboard, priority queue | Sorted set |
| Durable event log and worker groups | Stream |
| Daily active users, 0/1 feature state | Bitmap |
| Approximate distinct users in large data | HyperLogLog |
| Nearby stores or delivery locations | Geospatial |

### D. Master Command Cheat Sheet

```bash
# Connection and diagnostics
PING
INFO memory
CLIENT LIST
SLOWLOG GET 10
DBSIZE

# Keys
SET user:1 "Nasim" EX 300
GET user:1
EXISTS user:1
TTL user:1
DEL user:1
SCAN 0 MATCH "user:*" COUNT 100

# String / number
SETNX lock:job "1"
INCR likes:post:42
INCRBY inventory:sku:100 5
DECR inventory:sku:100

# Hash
HSET user:1 name "Nasim" role "developer"
HGET user:1 name
HGETALL user:1
HINCRBY user:1 points 10

# List
LPUSH queue:emails job-1
BRPOP queue:emails 5
LTRIM feed:1 0 99

# Set
SADD post:42:tags node redis backend
SMEMBERS post:42:tags
SISMEMBER post:42:tags redis
SINTER user:1:followers user:2:followers

# Sorted set
ZADD leaderboard 500 user:1
ZINCRBY leaderboard 25 user:1
ZREVRANGE leaderboard 0 9 WITHSCORES
ZRANK leaderboard user:1

# Stream
XADD events * type "user.created" userId "1"
XREAD COUNT 10 STREAMS events 0
XGROUP CREATE events workers 0 MKSTREAM
XREADGROUP GROUP workers worker-1 COUNT 10 BLOCK 5000 STREAMS events >

# Pub/Sub
PUBLISH notifications '{"title":"Welcome"}'
SUBSCRIBE notifications
PSUBSCRIBE "notifications:*"

# Bitmap
SETBIT dau:2026-11-23 42 1
GETBIT dau:2026-11-23 42
BITCOUNT dau:2026-11-23
```

### E. Interview Problem Patterns

#### Pattern 1: Atomic inventory reservation

Never perform a separate `GET` and `SET` for stock updates. Use an atomic Lua script or a Redis atomic command:

```lua
-- reserve-stock.lua
local stock = tonumber(redis.call("GET", KEYS[1]) or "0")
local quantity = tonumber(ARGV[1])

if stock < quantity then
  return 0
end

redis.call("DECRBY", KEYS[1], quantity)
return 1
```

```js
const result = await redis.eval(
  `local stock = tonumber(redis.call("GET", KEYS[1]) or "0")
   local quantity = tonumber(ARGV[1])
   if stock < quantity then return 0 end
   redis.call("DECRBY", KEYS[1], quantity)
   return 1`,
  1,
  'inventory:sku:100',
  2
);
```

#### Pattern 2: Distributed lock

```js
const token = crypto.randomUUID();
const acquired = await redis.set(lockKey, token, 'NX', 'PX', 10000);

if (acquired === 'OK') {
  try {
    // Critical section
  } finally {
    await redis.eval(
      `if redis.call("GET", KEYS[1]) == ARGV[1] then
         return redis.call("DEL", KEYS[1])
       end
       return 0`,
      1,
      lockKey,
      token
    );
  }
}
```

The check-before-delete Lua script prevents one process from deleting a lock that has already expired and been acquired by another process.

#### Pattern 3: Fixed-window rate limiter

```js
async function allowRequest(userId) {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60);
  }

  return count <= 100;
}
```

For precise behavior across a rolling window, use a sorted set:

```js
async function slidingWindow(userId) {
  const now = Date.now();
  const key = `ratelimit:${userId}`;

  await redis.zremrangebyscore(key, '-inf', now - 60_000);
  await redis.zadd(key, now, `${now}:${crypto.randomUUID()}`);
  await redis.expire(key, 60);

  const count = await redis.zcard(key);
  return count <= 100;
}
```

### F. Interview Main Project: Redis Feature API

This complete example combines caching, atomic counters, an inventory lock, leaderboards, and a queue into one Express service.

```text
Basic-Radis/
  src/
    index.js
    redis.js
  package.json
  docker-compose.yml
```

Install and start Redis:

```bash
npm install express ioredis
docker compose up -d redis
```

Create `src/redis.js`:

```js
import Redis from 'ioredis';

export const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  }
);
```

Create `src/index.js`:

```js
import express from 'express';
import crypto from 'node:crypto';
import { redis } from './redis.js';

const app = express();
app.use(express.json());

app.get('/health', async (_req, res) => {
  res.json({ redis: await redis.ping() });
});

// Cache-aside API
app.get('/users/:id', async (req, res) => {
  const key = `user:${req.params.id}:profile`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json({ source: 'redis', data: JSON.parse(cached) });
  }

  const data = {
    id: req.params.id,
    name: `User ${req.params.id}`,
  };

  await redis.set(key, JSON.stringify(data), 'EX', 60);
  res.json({ source: 'database', data });
});

// Atomic page-view counter
app.post('/posts/:id/view', async (req, res) => {
  const count = await redis.incr(`post:${req.params.id}:views`);
  res.json({ views: count });
});

// Redis leaderboard
app.post('/leaderboard/score', async (req, res) => {
  const { userId, score } = req.body;
  if (!userId || !Number.isFinite(Number(score))) {
    return res.status(400).json({ error: 'userId and numeric score are required' });
  }

  await redis.zadd('leaderboard', Number(score), userId);
  const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
  res.json({ top10 });
});

// Fixed-window rate limit
app.post('/comments', async (req, res) => {
  const userId = req.ip;
  const window = Math.floor(Date.now() / 60_000);
  const key = `comments:${userId}:${window}`;

  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);

  if (count > 10) {
    return res.status(429).json({ error: 'Try again later' });
  }

  res.status(201).json({ comment: req.body.text });
});

// Token-safe distributed lock
app.post('/jobs/report', async (_req, res) => {
  const key = 'lock:generate-report';
  const token = crypto.randomUUID();
  const acquired = await redis.set(key, token, 'NX', 'PX', 10_000);

  if (acquired !== 'OK') {
    return res.status(409).json({ error: 'Report is already being generated' });
  }

  try {
    await redis.lpush(
      'jobs:reports',
      JSON.stringify({ id: crypto.randomUUID(), type: 'monthly-report' })
    );
    res.status(202).json({ status: 'queued' });
  } finally {
    await redis.eval(
      `if redis.call("GET", KEYS[1]) == ARGV[1] then
         return redis.call("DEL", KEYS[1])
       end
       return 0`,
      1,
      key,
      token
    );
  }
});

app.listen(3000, () =>
  console.log('Redis interview API: http://localhost:3000')
);
```

Run:

```bash
npm run dev
curl http://localhost:3000/health
curl http://localhost:3000/users/42
curl -X POST http://localhost:3000/posts/42/view
curl -X POST http://localhost:3000/comments -H "Content-Type: application/json" -d "{\"text\":\"Hello Redis\"}"
```

### G. Production Failure & Trade-Off Questions

| Interview question | Strong answer |
|---|---|
| Redis is down. What happens? | API should fail gracefully or bypass cache; Redis data that is not durable or replicated may be unavailable. The database must remain authoritative. |
| Cache holds stale data | Use TTL, explicit invalidation on writes, versioned keys, or event-driven invalidation. |
| Same cache key misses for many users | Add random TTL jitter, request coalescing, locks, and cache warming. |
| Redis memory is full | Add `maxmemory`, choose an eviction policy, delete hot/big keys, or scale vertically/horizontally. |
| A key is too large | Split it, paginate collection reads, avoid `HGETALL`/`LRANGE 0 -1`, and monitor `MEMORY USAGE`. |
| Need persistence | Use AOF for stronger write durability and RDB for backup/restore; test recovery regularly. |
| Need high availability | Use Redis Sentinel or Redis Cluster with replicas, authentication, TLS, health checks, and backpressure. |
| Pub/Sub message is lost | Pub/Sub is ephemeral; use Streams or a dedicated durable broker when delivery guarantees are required. |
| Redis lock concerns | Use a unique token, short TTL, Lua compare-and-delete, and fencing tokens for correctness in distributed operations. |
| Redis is a database or cache? | Redis can serve both roles, but an external database is usually authoritative unless Redis persistence and recovery requirements are explicitly designed. |

### H. Redis Cluster vs Replication vs Sentinel

```text
Replication:          same data on multiple nodes
                      one primary writes; replicas serve/read (if configured)

Sentinel:             monitors a primary-replica system
                      provides automatic primary failover
                      still has one primary data path, not horizontal sharding

Cluster:              divides keyspace across 16,384 slots
                      shards write load across primaries
                      each primary normally has replicas
                      suitable for horizontal scaling
```

### I. Persistence Comparison

| Feature | RDB | AOF |
|---|---|---|
| Format | Point-in-time binary snapshot | Append-only write log |
| Writes | Fork-based periodic snapshot | Every write, every second, or every write |
| Recovery | Fast | Usually slower than RDB |
| Durability | May lose changes since the last snapshot | Better durability depending on `fsync` policy |
| Typical use | Backups and recovery | Durable primary persistence |

Best practice: many production systems use RDB plus AOF. Persistence settings and recovery procedures should be tested.

### J. One-Minute Final Revision

1. Redis is RAM-first and supports atomic command execution.
2. Redis 6+ uses I/O threads, while command execution remains in Redis's main thread model.
3. Cache-aside is the most common cache pattern.
4. TTL, eviction, and negative caching prevent stale or unbounded data.
5. Use `SET key value NX EX ttl` for a safe short-lived lock.
6. Delete a distributed lock only with a Lua compare-and-delete script.
7. Use Streams for durable event processing; Pub/Sub is not durable.
8. Avoid `KEYS *`, large keys, blocking commands, and `MONITOR` in production.
9. Use `SCAN`, pipelining, and connection reuse.
10. Use RDB/AOF, replicas, TLS, ACL, and least-privilege credentials.

---
