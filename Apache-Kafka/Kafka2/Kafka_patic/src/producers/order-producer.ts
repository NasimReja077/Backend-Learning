import { kafka } from "../config/kafka";
import { randomUUID } from "node:crypto";
import {
  ORDER_PLACED_TOPIC,
  OrderPlacedEvent,
} from "../events/order-placed.event";

const producer = kafka.producer();

let orderNumber = 1;

function createOrderPlacedEvent(): OrderPlacedEvent {
  const userId = `user-${Math.ceil(Math.random() * 10)}`;

  return {
    eventId: randomUUID(),
    eventType: "ORDER_PLACED",
    orderId: `order-${orderNumber++}`,
    userId,
    amount: Number((Math.random() * 500 + 500).toFixed(2)),
    createdAt: new Date().toISOString(),
  };
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
  await producer.connect();
  console.log("Order producer connected");

  try {
    while (!stopping) {
      const event = createOrderPlacedEvent();

      await producer.send({
        topic: ORDER_PLACED_TOPIC,
        messages: [
          {
            key: event.userId,
            value: JSON.stringify(event),
          },
        ],
      });

      console.log(
        `Produced ${event.eventType}: ${event.orderId} for ${event.userId}`,
      );
      await delay(2000);
    }
  } finally {
    await producer.disconnect();
  }
}

let stopping = false;

process.once("SIGINT", () => {
  stopping = true;
});

main().catch(async (error: unknown) => {
  console.error("Producer error:", error);
  process.exitCode = 1;
});
