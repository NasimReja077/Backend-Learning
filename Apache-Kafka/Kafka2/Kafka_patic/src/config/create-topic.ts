import { kafka } from "./kafka";
import { ORDER_PLACED_TOPIC } from "../events/order-placed.event";

const admin = kafka.admin();

async function main() {
  await admin.connect();

  try {
    const created = await admin.createTopics({
      topics: [
        {
          topic: ORDER_PLACED_TOPIC,
          numPartitions: 3,
          replicationFactor: 1,
        },
      ],
    });

    console.log(
      created
        ? `Topic created: ${ORDER_PLACED_TOPIC}`
        : `Topic already exists: ${ORDER_PLACED_TOPIC}`,
    );
  } finally {
    await admin.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Topic creation failed:", error);
  process.exitCode = 1;
});
