import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const key = "cities";

try {
    await client.del(key);

    const added = await client.geoadd(
        key,
        13.361389, 38.115556, "Palermo",
        15.087269, 37.502669, "Catania"
    );
    console.log("Locations added:", added);

    const positions = await client.geopos(key, "Palermo", "Catania");
    console.log("Coordinates [longitude, latitude]:", positions);

    const distance = await client.geodist(key, "Palermo", "Catania", "km");
    console.log("Distance in kilometers:", distance);

    const nearbyCities = await client.georadius(
        key,
        13.361389,
        38.115556,
        200,
        "km",
        "WITHDIST",
        "ASC"
    );
    console.log("Cities within 200 km of Palermo:", nearbyCities);
} finally {
    await client.quit();
}