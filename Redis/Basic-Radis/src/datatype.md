# **Redis Data Structures – Complete Explanation**

Your code covers **6 major Redis data structures and concepts**:

1. Redis Strings
2. Redis Hashes
3. Redis Lists
4. Redis Sets
5. Redis Sorted Sets
6. Redis Streams

These are important parts of **Redis Core Data Structures**. They help you choose the right way to store, retrieve, update, and process data in Redis.

You have already studied some of these concepts individually. Now let's connect all six, understand every method in your code, why to use it, and where it fits in real-world applications.



Redis fundamentals

6 data structures



## **1. First understand the big picture**

Redis is an in-memory data store. It stores data as key-value pairs, but the value can have different structures.

| Data structure | Stores                               | Best use case                  |
| -------------- | ------------------------------------ | ------------------------------ |
| String         | Text, numbers, JSON text             | Cache, OTP, counters           |
| Hash           | Field-value pairs                    | User profiles, product details |
| List           | Ordered sequence, duplicates allowed | Queues, recent activity        |
| Set            | Unique unordered members             | Online users, unique visitors  |
| Sorted Set     | Unique members with scores           | Leaderboards, rankings         |
| Stream         | Persistent ordered event entries     | Event processing, messaging    |

Think about an e-commerce application:

- String: store an OTP or cached product count.
- Hash: store product details.
- List: store pending jobs.
- Set: store currently online users.
- Sorted Set: rank customers by reward points.
- Stream: record order-created and payment-completed events.

[Strings, Sets, and Surprises: What Most Devs Miss in Redis Basics | by The Outage Specialist | Medium](https://images.openai.com/static-rsc-4/yRRexSKKqU4A4KlWn83y_QN8jLu0S6tU45z0z6CTKAbXgthX7sya6AE1K9m7YPCCtPF7y3WbE7BfgFsRWMnZtSQ_Akm-DCEnLN89xIAfAMYCTAvxdvbWK6vY-0norzxsfyM8ipZczBQyGAxQqzVrnOfnPEfupuo8aeGGOkhr_WQ?purpose=inline)

[medium.com](https://medium.com/%40TheOutageSpecialist/strings-sets-and-surprises-what-most-devs-miss-in-redis-basics-5baece299364?utm_source=chatgpt.com)

# **2. Redis Strings**

Basic data structure

**File:** `RedisStrings.js`

### **What is a Redis String?**

A Redis String is the simplest Redis data type. It stores a sequence of bytes, commonly used for text, numbers, or serialized JSON.

Example:

```
SET user:1 Nasim
GET user:1
```

Output:

```
"Nasim"
```

### **Why use Strings?**

Use Redis Strings when you need:

- Simple key-value storage.
- API response caching.
- OTP storage.
- Counters.
- Temporary tokens.
- JSON stored as text.

### **Methods in your code**

| Method     | Redis command | Purpose             |
| ---------- | ------------- | ------------------- |
| `set()`    | SET           | Store a value       |
| `get()`    | GET           | Retrieve a value    |
| `append()` | APPEND        | Add text to the end |
| `del()`    | DEL           | Delete a key        |

### **2.1&#x20;**`SET`**&#x20;– Store a value**

```
await redis.set(stringKey(req.params.key), value);
```

Example:

```
SET username Nasim
```

Output:

```
OK
```

**Why?** To save data against a unique key.

You can also set expiration:

```
SET otp:123456 847291 EX 300
```

This stores the OTP for 300 seconds (5 minutes).

Other useful options:

```
SET token abc123 NX EX 60
```

- `NX`: only set if the key does not exist.
- `EX 60`: expire after 60 seconds.

`XX` is the opposite condition: only update an existing key.

### **2.2&#x20;**`GET`**&#x20;– Retrieve a value**

```
const value = await redis.get(stringKey(req.params.key));
```

Example:

```
GET username
```

Output:

```
"Nasim"
```

If the key does not exist, Redis returns `nil`; ioredis returns `null`.

Your code correctly checks this:

```
if (value === null) {
    return res.status(404).json({
        message: "String not found"
    });
}
```

### **2.3&#x20;**`APPEND`**&#x20;– Add text to an existing value**

```
const length = await redis.append(
    stringKey(req.params.key),
    value
);
```

Example:

```
SET message Hello
APPEND message " World"
GET message
```

Output:

```
"Hello World"
```

`APPEND` returns the new string length, not the appended text.

**When to use:** Simple string concatenation or building small text values. It is generally not a substitute for a proper logging or messaging system.

### **2.4&#x20;**`DEL`**&#x20;– Delete a key**

```
const deleted = await redis.del(stringKey(req.params.key));
```

Output:

- `1`: a key was deleted.
- `0`: the key did not exist.

### **More useful String commands**

| Command    | Purpose                  | Example               |
| ---------- | ------------------------ | --------------------- |
| `MGET`     | Read multiple keys       | `MGET user:1 user:2`  |
| `MSET`     | Set multiple keys        | `MSET a 10 b 20`      |
| `INCR`     | Increase by 1            | `INCR views`          |
| `INCRBY`   | Increase by a number     | `INCRBY views 10`     |
| `DECR`     | Decrease by 1            | `DECR stock`          |
| `DECRBY`   | Decrease by a number     | `DECRBY stock 5`      |
| `GETRANGE` | Read a substring         | `GETRANGE name 0 3`   |
| `SETRANGE` | Replace part of a string | `SETRANGE name 0 ABC` |
| `STRLEN`   | Get string length        | `STRLEN name`         |
| `EXPIRE`   | Set expiration           | `EXPIRE name 60`      |
| `TTL`      | Check remaining lifetime | `TTL name`            |

**Real-life example – API caching**

Suppose your MERN application frequently retrieves a product from MongoDB.

1. Check Redis for `product:101`.
2. If found, return the cached value.
3. If missing, retrieve it from MongoDB.
4. Save the result in Redis using `SET ... EX`.
5. Return the result.

This is called the **Cache-Aside Pattern**.

# **3. Redis Hashes**

Basic data structure

**File:** `RedisHashMaps.js`

### **What is a Redis Hash?**

A Redis Hash stores multiple field-value pairs inside one Redis key.

Example:

```
HSET bike:1 model Deimos brand Ergonom price 4972
```

Logical representation:

**Redis key:&#x20;**`bike:1`

model

**Deimos**

brand

**Ergonom**

type

**Enduro bikes**

price

**4972**

### **Why use Hashes?**

Imagine you have 10,000 users.

You could store each profile as a JSON String:

```
SET user:1 '{"name":"Nasim","age":23,"city":"Kolkata"}'
```

Or use a Hash:

```
HSET user:1 name Nasim age 23 city Kolkata
```

With a Hash, you can update one field without retrieving and rewriting the entire JSON object.

### **Methods in your code**

| ioredis method | Redis command | Purpose                   |
| -------------- | ------------- | ------------------------- |
| `hset()`       | HSET          | Create or update fields   |
| `hget()`       | HGET          | Read one field            |
| `hgetall()`    | HGETALL       | Read all fields           |
| `hmget()`      | HMGET         | Read multiple fields      |
| `hincrby()`    | HINCRBY       | Increment a numeric field |
| `hdel()`       | HDEL          | Delete fields             |
| `hexists()`    | HEXISTS       | Check if a field exists   |

### **3.1&#x20;**`HSET`**&#x20;– Store multiple fields**

```
const res1 = await client.hset(bikeKey, bike);
```

Your object:

```
const bike = {
    model: "Deimos",
    brand: "Ergonom",
    type: "Enduro bikes",
    price: 4972
};
```

ioredis supports passing an object to `hset()`.

Equivalent Redis command:

```
HSET bike:1 model Deimos brand Ergonom type "Enduro bikes" price 4972
```

Returns the number of newly added fields.

If you update an existing field, that field is not counted as newly added.

### **3.2&#x20;**`HGET`**&#x20;– Get one field**

```
const model = await client.hget(bikeKey, "model");
```

Equivalent:

```
HGET bike:1 model
```

Output:

```
"Deimos"
```

**Why?** You only need one field, so there is no need to retrieve the entire object.

### **3.3&#x20;**`HGETALL`**&#x20;– Get all fields**

```
const bikeData = await client.hgetall(bikeKey);
```

Equivalent:

```
HGETALL bike:1
```

Output from ioredis:

```
{
    model: "Deimos",
    brand: "Ergonom",
    type: "Enduro bikes",
    price: "4972"
}
```

Important: Redis Hash values are returned as strings, including numeric-looking values.

### **3.4&#x20;**`HMGET`**&#x20;– Get selected fields**

```
const result = await client.hmget(
    bikeKey,
    "model",
    "price"
);
```

Equivalent:

```
HMGET bike:1 model price
```

Output:

```
["Deimos", "4972"]
```

**Why?** To avoid fetching unnecessary fields.

### **3.5&#x20;**`HINCRBY`**&#x20;– Increment a numeric field**

```
const result = await client.hincrby(
    bikeKey,
    "price",
    100
);
```

Equivalent:

```
HINCRBY bike:1 price 100
```

If the original price is 4972, the new price becomes 5072.

You can decrease it:

```
HINCRBY bike:1 price -100
```

This is an atomic Redis operation.

### **Other important Hash commands**

| Command        | Purpose                                       |
| -------------- | --------------------------------------------- |
| `HKEYS`        | Get all field names                           |
| `HVALS`        | Get all field values                          |
| `HLEN`         | Count fields                                  |
| `HDEL`         | Delete selected fields                        |
| `HEXISTS`      | Check field existence                         |
| `HSETNX`       | Set a field only if it doesn't exist          |
| `HINCRBYFLOAT` | Increment a numeric field by a decimal amount |

### **Real-life use case – User Profile Cache**

For your BartaLap application, you could cache a user's basic profile:

```
HSET user:101 username Nasim email nasim@example.com status online
```

When the frontend requests a profile:

1. Check `user:101` in Redis.
2. If it exists, return the profile.
3. Otherwise, read MongoDB.
4. Store the profile in Redis.

**Important:** MongoDB should usually remain your source of truth. Redis is the fast cache, not necessarily your permanent database.

# **4. Redis Lists**

Basic data structure

**File:** `RedisLists.js`

### **What is a Redis List?**

A Redis List is an ordered collection of strings.

It allows:

- Duplicate values.
- Insertion from the left.
- Insertion from the right.
- Removal from either end.
- Reading a range of elements.

Imagine this:

```
[ hello, hola, pingpong ]
```

Indexes:

```
Index:   0       1         2
Value: hello   hola    pingpong
```

### **Why use Lists?**

- Simple queues.
- Recent activity.
- Notification buffers.
- Task processing.
- Message history in simple cases.

[Demystifying Redis Messaging. Redis is well-known as a Cache. But it… | by Tarunannapareddy | Medium](https://images.openai.com/static-rsc-4/li8kB0o-27IHdAXUcxXOTSJ5FI4N_MJJdaZ3fKDW2xPmB3NXaCXd5o7j9j5mGgKgCeCTLF7VtgB7ucRCSSNGiaOTxTG-VLvaeD50ESU3cUHlW6nY1Ojchthm2KNdfjvtN1XjDRZUpPCrB-mVLA0O4NZ5NpL1NE6foT433888_X8?purpose=inline)

[medium.com](https://medium.com/%40tarunannapareddy1997/demystifying-redis-messaging-0448e4dba9e0?utm_source=chatgpt.com)

### **4.1&#x20;**`LPUSH`**&#x20;– Insert from the left**

```
const length = await redis.lpush(
    listKey(req.params.key),
    ...values
);
```

Example:

```
LPUSH messages hola
LPUSH messages hello
```

List:

```
[hello, hola]
```

**Why?** Add new items to the beginning of the list.

### **4.2&#x20;**`RPUSH`**&#x20;– Insert from the right**

```
await redis.rpush(
    listKey(req.params.key),
    ...values
);
```

Example:

```
RPUSH messages pingpong
```

List:

```
[hello, hola, pingpong]
```

**Why?** Append new items to the end.

### **4.3&#x20;**`LRANGE`**&#x20;– Read a range**

```
const values = await redis.lrange(
    listKey(req.params.key),
    Number(start),
    Number(stop)
);
```

Example:

```
LRANGE messages 0 -1
```

Output:

```
1) hello
2) hola
3) pingpong
```

Important:

- Redis indexes start at `0`.
- `-1` means the last element.
- The stop index is inclusive.

Examples:

```
LRANGE messages 0 1
LRANGE messages 1 -1
LRANGE messages 0 -1
```

### **4.4&#x20;**`LPOP`**&#x20;– Remove from the left**

```
const value = await redis.lpop(listKey(req.params.key));
```

Example:

```
LPOP messages
```

Returns and removes the first item.

### **4.5&#x20;**`RPOP`**&#x20;– Remove from the right**

```
const value = await redis.rpop(listKey(req.params.key));
```

Example:

```
RPOP messages
```

Returns and removes the last item.

### **4.6&#x20;**`LLEN`**&#x20;– Get list length**

```
const length = await redis.llen(listKey(req.params.key));
```

Example:

```
LLEN messages
```

Returns the number of items.

### **4.7&#x20;**`LMOVE`**&#x20;– Move an item between lists**

```
const value = await redis.lmove(
    listKey(req.params.source),
    listKey(req.params.destination),
    from,
    to
);
```

Example:

```
LMOVE pending processing RIGHT LEFT
```

This means:

- Take the rightmost item from `pending`.
- Insert it at the left side of `processing`.
- Return the moved value.

**Why?** To move work from a waiting queue into a processing queue.

This is useful when designing a simple worker system.

### **4.8&#x20;**`LTRIM`**&#x20;– Keep only a range**

```
await redis.ltrim(
    listKey(req.params.key),
    Number(start),
    Number(stop)
);
```

Example:

```
LTRIM recent:views 0 9
```

Keeps only the first 10 elements and removes the rest.

**Why?** To limit the size of recent activity or recent messages.

### **4.9&#x20;**`BLPOP`**&#x20;and&#x20;**`BRPOP`**&#x20;– Blocking pop**

Your code:

```
const result = await blockingRedis.blpop(
    key,
    Number(timeout)
);
```

Equivalent:

```
BLPOP messages 10
```

This waits up to 10 seconds for an item.

- If an item becomes available, Redis removes and returns it.
- If the timeout expires, Redis returns `nil`.
- `0` means wait indefinitely.

Why use a separate `blockingRedis` connection?

Because a blocking command can hold that connection while it waits. Keeping another connection for ordinary Redis commands avoids blocking those operations.

### **FIFO vs LIFO**

| Pattern | Insert | Remove | Behavior            |
| ------- | ------ | ------ | ------------------- |
| FIFO    | LPUSH  | RPOP   | First in, first out |
| FIFO    | RPUSH  | LPOP   | First in, first out |
| LIFO    | LPUSH  | LPOP   | Last in, first out  |
| LIFO    | RPUSH  | RPOP   | Last in, first out  |

### **Real-life use case – Email Queue**

Imagine a user registers on your MERN Blog application.

You need to:

1. Save the user in MongoDB.
2. Add a welcome-email job to Redis.
3. A background worker takes the job.
4. The worker sends the email.
5. The worker marks the job complete.

This avoids making the registration API wait for the email provider.

**Important limitation:** `LPOP` or `RPOP` removes the job immediately. If the worker crashes after removing it but before completing the task, the job can be lost.

For more reliable job processing, use Redis Streams or BullMQ. A simple List-based queue can use `LMOVE`/`BLMOVE` with a processing list, but you still need recovery and acknowledgement logic.

# **5. Redis Sets**

Basic data structure

**File:** `RedisSets.js`

### **What is a Redis Set?**

A Redis Set is an unordered collection of unique string members.

Example:

```
SADD online:users user1 user2 user3
```

Adding `user1` again will not create a duplicate.

```
SADD online:users user1
```

Returns `0` because the member already exists.

### **Why use Sets?**

- Online user tracking.
- Unique visitors.
- Unique likes.
- Tags and categories.
- Shared membership.
- Finding common elements between groups.

[redis基本数据类型 set类型 - 高佳丰 - 博客园](https://images.openai.com/static-rsc-4/W8BuZY1mon0IzaIEy1QupgbaLbohJOpe9h8LNbo6Q5voBzP2NicEFlYN0rzFMBaer4ZSt1lqOZ6b5NOM3sKuMYUhmtGZebKaitrYLkEZcCYfjgViAASFHfgn7yuZoZxyBTd_wd-YNlSBSyDRo1JDjrIu3FrN2oprqCiAhj4DaPc?purpose=inline)

[cnblogs.com](https://www.cnblogs.com/ggborn-001/p/17082010.html?utm_source=chatgpt.com)

### **5.1&#x20;**`SADD`**&#x20;– Add members**

```
const added = await redis.sadd(
    setKey(req.params.key),
    ...members
);
```

Example:

```
SADD online:users 101 102 103
```

Output:

```
(integer) 3
```

Add a duplicate:

```
SADD online:users 101
```

Output:

```
(integer) 0
```

The result counts only newly added members.

### **5.2&#x20;**`SREM`**&#x20;– Remove members**

```
const removed = await redis.srem(
    setKey(req.params.key),
    ...members
);
```

Example:

```
SREM online:users 102
```

Removes user 102.

### **5.3&#x20;**`SISMEMBER`**&#x20;– Check membership**

```
const isMember = await redis.sismember(
    setKey(req.params.key),
    member
);
```

Example:

```
SISMEMBER online:users 101
```

Returns:

- `1`: member exists.
- `0`: member doesn't exist.

### **5.4&#x20;**`SMEMBERS`**&#x20;– Get all members**

```
const members = await redis.smembers(
    setKey(req.params.key)
);
```

Example:

```
SMEMBERS online:users
```

Returns all members. Their order is not guaranteed.

### **5.5&#x20;**`SCARD`**&#x20;– Count members**

```
const count = await redis.scard(
    setKey(req.params.key)
);
```

Example:

```
SCARD online:users
```

Returns the number of unique members.

### **5.6&#x20;**`SINTER`**&#x20;– Find common members**

Your code:

```
const members = await redis.sinter(
    ...keys.map(setKey)
);
```

Example:

```
SADD JavaScript user1 user2 user3
SADD React user2 user3 user4
SINTER JavaScript React
```

Output:

```
user2
user3
```

**Why?** To find users who belong to multiple groups.

### **Other useful Set commands**

| Command       | Purpose                                       |
| ------------- | --------------------------------------------- |
| `SISMEMBER`   | Check membership                              |
| `SMISMEMBER`  | Check multiple members                        |
| `SMEMBERS`    | Retrieve all members                          |
| `SCARD`       | Count members                                 |
| `SUNION`      | Combine sets                                  |
| `SDIFF`       | Find members only in the first set            |
| `SINTER`      | Find common members                           |
| `SPOP`        | Remove and return a random member             |
| `SRANDMEMBER` | Return random member(s) without removing them |

### **Real-life use case – Online Users in BartaLap**

Suppose users log in to your chat application.

```
SADD online:users user:101
SADD online:users user:102
```

When user 101 logs out:

```
SREM online:users user:101
```

Check whether a user is online:

```
SISMEMBER online:users user:102
```

However, there is a production issue: if a user's browser crashes or the server disconnects unexpectedly, you might never receive a logout event.

A better design uses a **heartbeat and expiration strategy**, often with a Sorted Set or per-user TTL, to detect stale connections. For multiple browser tabs, track connections separately rather than removing a user when only one tab closes.

# **6. Redis Sorted Sets**

Intermediate data structure

**File:** `RedisSortedSets.js`

### **What is a Sorted Set?**

A Redis Sorted Set stores unique members, each associated with a numeric score.

Redis automatically sorts members by score.

Example:

```
ZADD leaderboard 10 piyush 1 john 2 jane 6 peer
```

Logical representation:

| Member | Score |
| ------ | ----- |
| john   | 1     |
| jane   | 2     |
| peer   | 6     |
| piyush | 10    |

**Important:** Each member must be unique, but multiple members can have the same score.

### **Why use Sorted Sets?**

- Gaming leaderboards.
- Ranking systems.
- Top-selling products.
- Most-viewed articles.
- Scheduled jobs ordered by execution time.
- Users ranked by reward points.

[Redis is great](https://images.openai.com/static-rsc-4/rKKtgs-hTe0WN6bJnYPzNygxPfVgmtCuxSLJFmRW_a1lWrQQr4Py9duBKSFJQcSnm4_FCS99qqKJu6bw4oWZ_0PzONpEAIlWcnmqG_chSbc6VyB_0jys9AYLtgwTYTmdFFioMjUhhRL1zJgRIOa7acoHg1Hry5fLCwTYkGO9Nrw?purpose=inline)

[tigerabrodi.blog](https://tigerabrodi.blog/redis-is-great?utm_source=chatgpt.com)

### **6.1&#x20;**`ZADD`**&#x20;– Add members with scores**

Your code:

```
const added = await client.zadd(
    key,
    10, "piyush",
    1, "john",
    2, "jane",
    6, "peer"
);
```

Equivalent:

```
ZADD score 10 piyush 1 john 2 jane 6 peer
```

Returns the number of newly added members.

If you add an existing member with a different score, Redis updates the score.

```
ZADD score 20 piyush
```

Piyush's score becomes 20.

### **6.2&#x20;**`ZRANGE`**&#x20;– Lowest to highest**

```
const ascending = await client.zrange(key, 0, -1);
```

Equivalent:

```
ZRANGE score 0 -1
```

Output:

```
john
jane
peer
piyush
```

This returns members in ascending score order.

### **6.3&#x20;**`ZREVRANGE`**&#x20;– Highest to lowest**

```
const descending = await client.zrevrange(key, 0, -1);
```

Equivalent:

```
ZREVRANGE score 0 -1
```

Output:

```
piyush
peer
jane
john
```

Useful for leaderboards.

### **6.4&#x20;**`ZRANK`**&#x20;– Find rank**

```
const rank = await client.zrank(key, "piyush");
```

Output:

```
3
```

Why 3? Redis ranks start from zero.

| Member | Score | `ZRANK` |
| ------ | ----- | ------- |
| john   | 1     | 0       |
| jane   | 2     | 1       |
| peer   | 6     | 2       |
| piyush | 10    | 3       |

For a human-facing leaderboard, add 1 to the returned rank.

### **Other important Sorted Set commands**

| Command         | Purpose                            |
| --------------- | ---------------------------------- |
| `ZSCORE`        | Get a member's score               |
| `ZINCRBY`       | Increment a score                  |
| `ZCARD`         | Count members                      |
| `ZREM`          | Remove members                     |
| `ZREVRANK`      | Get rank in descending order       |
| `ZRANGEBYSCORE` | Retrieve members in a score range  |
| `ZCOUNT`        | Count members within a score range |
| `ZPOPMIN`       | Remove lowest-score member         |
| `ZPOPMAX`       | Remove highest-score member        |

Modern Redis also provides `ZRANGE` options such as `REV`, `BYSCORE`, `LIMIT`, and `WITHSCORES`.

### **Real-life use case – Gaming Leaderboard**

Suppose users earn points in your application:

```
ZADD game:leaderboard 100 user:101
ZADD game:leaderboard 250 user:102
ZADD game:leaderboard 150 user:103
```

A user wins a game:

```
ZINCRBY game:leaderboard 50 user:101
```

Retrieve the top three:

```
ZREVRANGE game:leaderboard 0 2 WITHSCORES
```

This is much better than fetching every user's score from MongoDB and sorting everything on every request.

# **7. Redis Streams**

Intermediate / advanced

**File:** `RedisStreams.js`

### **What is a Redis Stream?**

Redis Streams are an append-only log of messages or events.

Each entry has:

- A unique ID.
- One or more field-value pairs.
- An insertion order.

Example:

```
XADD orders * event order-created orderId 1001
```

The `*` tells Redis to generate the entry ID automatically.

A stream could look like this:

**Stream:&#x20;**`orders`

Entry ID: 1730000000000-0

**event:** order-created

**orderId:** 1001

Entry ID: 1730000000001-0

**event:** order-created

**orderId:** 1002

*The IDs above are illustrative.*

### **Why use Streams?**

Unlike Pub/Sub, Streams retain entries so consumers can read events later.

Use them for:

- Order event processing.
- Payment processing workflows.
- Microservice communication.
- Audit events.
- Background event consumers.
- Reliable event-processing patterns.

### **7.1&#x20;**`XADD`**&#x20;– Add an entry**

```
const firstId = await client.xadd(
    streamKey,
    "*",
    "event", "order-created",
    "orderId", "1001"
);
```

Equivalent:

```
XADD orders * event order-created orderId 1001
```

Redis generates an ID, such as:

```
1730000000000-0
```

Each entry gets a unique stream ID.

### **7.2&#x20;**`XRANGE`**&#x20;– Read entries in an ID range**

```
const entries = await client.xrange(
    streamKey,
    "-",
    "+"
);
```

Equivalent:

```
XRANGE orders - +
```

- `-`: the earliest ID.
- `+`: the latest ID.

This reads the complete stream.

### **7.3&#x20;**`XLEN`**&#x20;– Get stream length**

```
const length = await client.xlen(streamKey);
```

Equivalent:

```
XLEN orders
```

Returns the number of entries.

### **7.4&#x20;**`XREAD`**&#x20;– Read new entries**

```
const readEntries = await client.xread(
    "STREAMS",
    streamKey,
    "0-0"
);
```

Equivalent:

```
XREAD STREAMS orders 0-0
```

`0-0` means read entries starting from the beginning.

For future entries after a known ID, you can use:

```
XREAD BLOCK 5000 STREAMS orders $
```

Here:

- `BLOCK 5000`: wait up to 5 seconds.
- `$`: start waiting for new entries, rather than reading existing entries.

### **The most important missing part: Consumer Groups**

Your code currently demonstrates basic Streams commands. It does not yet implement a complete consumer-group workflow.

Consumer groups allow multiple workers to share message processing.

Important commands:

| Command         | Purpose                                      |
| --------------- | -------------------------------------------- |
| `XGROUP CREATE` | Create a consumer group                      |
| `XREADGROUP`    | Read as a consumer                           |
| `XACK`          | Acknowledge completed processing             |
| `XPENDING`      | Inspect unacknowledged messages              |
| `XCLAIM`        | Claim pending messages from another consumer |
| `XAUTOCLAIM`    | Automatically claim idle pending messages    |
| `XINFO`         | Inspect stream/group information             |
| `XTRIM`         | Limit stream size                            |

### **How a consumer group works**

**Redis Stream: orders**

order-created events

**Consumer Group: order-workers**

**Worker 1**

Consumer A

**Worker 2**

Consumer B

Each message is assigned to one consumer in the group, then acknowledged after successful processing.

Example commands:

```
XGROUP CREATE orders order-workers 0 MKSTREAM
```

Read messages:

```
XREADGROUP GROUP order-workers worker-1 COUNT 5 STREAMS orders >
```

After successfully processing a message:

```
XACK orders order-workers 1730000000000-0
```

**Important:** A Stream does not automatically guarantee exactly-once processing. You must manage pending messages, retries, consumer recovery, and idempotency.

### **Real-life use case – E-commerce Order Events**

When an order is created:

```
XADD orders * event order-created orderId 1001
```

Workers can process that event:

- Inventory worker: update stock.
- Notification worker: send confirmation.
- Analytics worker: record order metrics.

You can use separate consumer groups if each service needs to receive every event. Consumers within one group share the group's workload.

# **8. Compare all six data structures**

This is one of the most important things to understand for interviews and real development.

| Requirement               | Best Redis structure | Example            |
| ------------------------- | -------------------- | ------------------ |
| Store OTP                 | String               | `otp:user:101`     |
| Cache user profile        | Hash or String       | `user:101`         |
| Process simple FIFO jobs  | List                 | `queue:emails`     |
| Track unique online users | Set                  | `online:users`     |
| Rank players by points    | Sorted Set           | `game:leaderboard` |
| Store and process events  | Stream               | `orders`           |

## **Lists vs Sets vs Sorted Sets vs Streams**

These four are often confused.

| Feature             | List                           | Set        | Sorted Set           | Stream                |
| ------------------- | ------------------------------ | ---------- | -------------------- | --------------------- |
| Preserves order     | Yes                            | No         | By score             | Yes                   |
| Allows duplicates   | Yes                            | No         | No duplicate members | Yes, separate entries |
| Score-based ranking | No                             | No         | Yes                  | No                    |
| Can retain events   | Yes, but limited queue pattern | No         | No                   | Yes                   |
| Consumer groups     | No                             | No         | No                   | Yes                   |
| Typical use         | Queue                          | Membership | Leaderboard          | Event processing      |

**Interview question: When would you use Redis Pub/Sub instead of Redis Streams?**

- Pub/Sub: when subscribers need live messages and losing messages while offline is acceptable.
- Streams: when messages should remain available for later consumption, with consumer groups and acknowledgements.

Remember: Pub/Sub is ephemeral. Streams provide a more durable event-processing model.

# **9. Your small project: Redis Data Structures Playground**

Your six files already form a good beginner project. Instead of treating them as unrelated examples, organize them as a single learning application.

**Project: Redis Data Structures Playground**

A Node.js + Express + Redis + ioredis learning API.

**Redis Server**

**Express API**

- Strings API
- Hashes API
- Lists API
- Sets API
- Sorted Sets API
- Streams API

**Postman**

**Redis CLI**

### **Recommended folder structure**

```
Basic-Redis/
│
├── src/
│   ├── config/
│   │   └── redis.js
│   │
│   ├── routes/
│   │   ├── strings.routes.js
│   │   ├── hashes.routes.js
│   │   ├── lists.routes.js
│   │   ├── sets.routes.js
│   │   ├── sortedSets.routes.js
│   │   └── streams.routes.js
│   │
│   └── server.js
│
├── .env
├── .gitignore
└── package.json
```

### **Install dependencies**

```
npm init -y
npm install express ioredis dotenv
npm install --save-dev nodemon
```

Add this to `package.json`:

```
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### **Redis connection**

`src/config/redis.js`

```
import Redis from "ioredis";

const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (error) => {
    console.error("Redis error:", error.message);
});

export default redis;
```

### **Example: Small Sorted Set leaderboard API**

This example turns your existing Sorted Set concept into a real API.

`src/routes/leaderboard.routes.js`

```
import express from "express";
import redis from "../config/redis.js";

const router = express.Router();

const leaderboardKey = "game:leaderboard";

// Add or update a player's score
router.post("/score", async (req, res, next) => {
    try {
        const { userId, score } = req.body;

        if (
            typeof userId !== "string" ||
            !userId.trim() ||
            !Number.isFinite(score)
        ) {
            return res.status(400).json({
                message: "Valid userId and score are required"
            });
        }

        const added = await redis.zadd(
            leaderboardKey,
            score,
            userId
        );

        res.json({
            success: true,
            added
        });
    } catch (error) {
        next(error);
    }
});

// Increase a player's score
router.patch("/score/:userId", async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!Number.isFinite(amount)) {
            return res.status(400).json({
                message: "amount must be a finite number"
            });
        }

        const score = await redis.zincrby(
            leaderboardKey,
            amount,
            req.params.userId
        );

        res.json({ score: Number(score) });
    } catch (error) {
        next(error);
    }
});

// Get top 10 players
router.get("/top", async (req, res, next) => {
    try {
        const players = await redis.zrevrange(
            leaderboardKey,
            0,
            9,
            "WITHSCORES"
        );

        const result = [];

        for (let i = 0; i < players.length; i += 2) {
            result.push({
                userId: players[i],
                score: Number(players[i + 1]),
                rank: result.length + 1
            });
        }

        res.json({ players: result });
    } catch (error) {
        next(error);
    }
});

export default router;
```

`src/server.js`

```
import express from "express";
import dotenv from "dotenv";
import redis from "./config/redis.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/leaderboard", leaderboardRoutes);

app.get("/health", async (req, res) => {
    const pong = await redis.ping();

    res.json({
        server: "running",
        redis: pong
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        message: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

One small correction to the example: load dotenv before importing modules that create the Redis connection. For predictable initialization, put `import "dotenv/config";` at the very top of `server.js`, or load it in your application's entry point before importing the Redis configuration.

### **Test with Postman**

Start Redis and your application:

```
npm run dev
```

**1. Add player score**



POST

`http://localhost:3000/api/leaderboard/score`



```
{
  "userId": "user101",
  "score": 100
}
```

**2. Increase player score**



PATCH

`http://localhost:3000/api/leaderboard/score/user101`



```
{
  "amount": 50
}
```

**3. Get top players**



GET

`http://localhost:3000/api/leaderboard/top`



Example response:

```
{
  "players": [
    {
      "userId": "user101",
      "score": 150,
      "rank": 1
    }
  ]
}
```

Try adding three or four players, increasing their scores, and checking the ranking.

# **10. Important corrections in your existing code**

Your code is a good learning foundation. Here are some things I would improve before using these patterns in a real application.

| File                 | Improvement                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| `RedisStrings.js`    | Add expiration options and input-size limits.                                   |
| `RedisHashMaps.js`   | Remember that numeric fields are returned as strings.                           |
| `RedisLists.js`      | Handle blocking commands with a dedicated connection, as you already do.        |
| `RedisSets.js`       | Avoid using `SMEMBERS` on extremely large sets without pagination alternatives. |
| `RedisSortedSets.js` | Use `WITHSCORES` when you need both members and scores.                         |
| `RedisStreams.js`    | Learn consumer groups, acknowledgements and pending-message recovery.           |

### **A few important technical details**

**1. Don't use&#x20;**`KEYS`**&#x20;in production**

You included:

```
KEYS user:*
```

This finds matching keys, but it can block Redis while scanning a large database.

Prefer:

```
SCAN 0 MATCH user:* COUNT 100
```

**2. Your Redis Lists support duplicates**

```
LPUSH messages hello
LPUSH messages hello
```

Both values are stored. Unlike Sets, Lists do not enforce uniqueness.

**3. Your Sorted Set rank starts from zero**

```
ZRANK score piyush
```

If the result is `3`, the human-facing rank is `4`.

**4. Your Streams example reads from the beginning**

```
client.xread("STREAMS", streamKey, "0-0");
```

Running this again can return the same entries. It is not a complete continuous consumer. Learn `XREAD BLOCK` and consumer groups for real processing.

**5. Your Express files all use port 3000**

If you start all six servers together, they will conflict. For the combined project, use one Express server and mount separate routers.

**6. Load environment variables before creating Redis connections**

For an ES module project, use:

```
import "dotenv/config";
```

at the beginning of your entry file, before importing the Redis configuration.

**7. Add production error handling**

Your original route handlers mostly don't catch Redis errors. Add error handling so a Redis connection failure does not produce unhandled promise rejections.
