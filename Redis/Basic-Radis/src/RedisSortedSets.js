import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const key = "score";

try {
    await client.del(key);

    const added = await client.zadd(
        key,
        10, "piyush",
        1, "jhon",
        2, "jane",
        6, "peer"
    );
    console.log("Members added:", added);

    const ascending = await client.zrange(key, 0, -1);
    console.log("Lowest to highest score:", ascending);

    const descending = await client.zrevrange(key, 0, -1);
    console.log("Highest to lowest score:", descending);

    const piyushRank = await client.zrank(key, "piyush");
    console.log("Piyush rank:", piyushRank);

    const jhonRank = await client.zrank(key, "jhon");
    console.log("Jhon rank:", jhonRank);
} finally {
    await client.quit();
}

/**
 *zadd score 10 piyush
(integer) 1
 zadd score 1 jhon
(integer) 1
zadd score 2 jane
(integer) 1
127.0.0.1:6379> zadd score 6 peer

===========
127.0.0.1:6379> zrange score 0 -1
1) "jhon"
2) "jane"
3) "peer"
4) "piyush"
127.0.0.1:6379> zrevrange score 0 -1
1) "piyush"
2) "peer"
3) "jane"
4) "jhon"
=================

127.0.0.1:6379> zrank score piyush
(integer) 3
127.0.0.1:6379> zrank score jhon
(integer) 0
127.0.0.1:6379> zrank score jane
(integer) 1
127.0.0.1:6379> 

 */
