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
 * XADD adds a new entry to a stream. 
 * XREAD reads one or more entries, starting at a given position and moving forward in time. 
 * XRANGE returns a range of entries between two supplied entry IDs.   
 * XLEN returns the length of a stream
 */

