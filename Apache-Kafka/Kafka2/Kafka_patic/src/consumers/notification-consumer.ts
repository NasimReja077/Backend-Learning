import { kafka } from "../config/kafka";
import {
  ORDER_PLACED_TOPIC,
  parseOrderPlacedEvent,
} from "../events/order-placed.event";

const consumer = kafka.consumer({ groupId: "notification-group" });

async function main() {
  await consumer.connect();
  console.log("Notification consumer connected");

  await consumer.subscribe({
    topic: ORDER_PLACED_TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const event = parseOrderPlacedEvent(message.value);

      console.log(
        `notification | partition=${partition} offset=${message.offset}`,
      );
      console.log(`send email for ${event.orderId} to ${event.userId}`);
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
      console.error("Failed to disconnect notification consumer:", error);
      process.exitCode = 1;
    });
});

main().catch(async (error: unknown) => {
  console.error("Notification consumer error:", error);
  try {
    await consumer.disconnect();
  } catch (disconnectError) {
    console.error("Failed to disconnect notification consumer:", disconnectError);
  }
  process.exitCode = 1;
});
