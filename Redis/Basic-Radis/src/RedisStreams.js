// topic - name: redis streams explanation for xadd, xread, xrange, xlen

import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const streamKey = "orders";

try {
    await client.del(streamKey);

    const firstId = await client.xadd(
        streamKey,
        "*",
        "event", "order-created",
        "orderId", "1001"
    );
    console.log("First entry ID:", firstId);

    const secondId = await client.xadd(
        streamKey,
        "*",
        "event", "order-created",
        "orderId", "1002"
    );
    console.log("Second entry ID:", secondId);

    const entries = await client.xrange(streamKey, "-", "+");
    console.log("Stream entries:", entries);

    const length = await client.xlen(streamKey);
    console.log("Stream length:", length);

    const readEntries = await client.xread("STREAMS", streamKey, "0-0");
    console.log("Read entries:", readEntries);
} finally {
    await client.quit();
}

/**
 * XADD - adds a new entry to a stream.
 * XREAD - reads one or more entries, starting at a given position and moving forward in time.
 * XRANGE - returns a range of entries between two supplied entry IDs.
 * XLEN - returns the length of a stream.
 * XREADGROUP - reads entries from a stream as part of a consumer group.
 * XACK - acknowledges that a message has been processed by a consumer in a consumer group.
 * XGROUP - manages consumer groups for a stream.
 * XPENDING - returns information about pending messages in a consumer group.
 * 
 * When to use - Redis Streams are useful for building real-time data pipelines, event sourcing, and message queues. They allow you to store and process a sequence of events in a time-ordered manner, making them suitable for applications that require reliable message delivery and processing.
 * 
 * exgample:
 * XADD orders * event order-created orderId 1001
 * XADD orders * event order-created orderId 1002
 * XRANGE orders - +
 * XLEN orders
 * XREAD STREAMS orders 0-0
 * 
 * Redis Streams -> store and process a sequence of events in a time-ordered manner, making them suitable for applications that require reliable message delivery and processing.
 * 
 */

