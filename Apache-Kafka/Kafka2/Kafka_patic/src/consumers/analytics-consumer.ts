import { kafka } from "../config/kafka";
import {
  ORDER_PLACED_TOPIC,
  parseOrderPlacedEvent,
} from "../events/order-placed.event";

const consumer = kafka.consumer({ groupId: "analytics-group" });

async function main() {
  await consumer.connect();
  console.log("Analytics consumer connected");

  await consumer.subscribe({
    topic: ORDER_PLACED_TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const event = parseOrderPlacedEvent(message.value);

      console.log(
        `Analytics | partition=${partition} offset=${message.offset}`,
      );
      console.log(
        `Track revenue $${event.amount} from order ${event.orderId}`,
      );
    },
  });
}

process.once("SIGINT", () => {
  consumer
    .disconnect()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((error: unknown) => {
      console.error("Failed to disconnect analytics consumer:", error);
      process.exitCode = 1;
    });
});

main().catch(async (error: unknown) => {
  console.error("Analytics consumer error:", error);
  try {
    await consumer.disconnect();
  } catch (disconnectError) {
    console.error("Failed to disconnect analytics consumer:", disconnectError);
  }
  process.exitCode = 1;
});
