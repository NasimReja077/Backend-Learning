const amqp = require("amqplib");

const QUEUE = process.env.RABBITMQ_QUEUE || "rq15_ready_unacked";
const PREFETCH = Number(process.env.PREFETCH || 3); // Number of messages to prefetch (unacked) before sending more
const ACK_DELAY_MS = Number(process.env.ACK_DELAY_MS || 4000); // Delay before acknowledging a message (in milliseconds)
const AUTO_ACK = process.env.AUTO_ACK === "true"; // Whether to automatically acknowledge messages (noAck) or manually acknowledge them

// This consumer demonstrates the difference between ready, unacked, and acked messages in RabbitMQ.
async function startConsumer() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  await channel.prefetch(PREFETCH);

  console.log(`Queue: ${QUEUE}`);
  console.log(`Prefetch: ${PREFETCH}`);
  console.log(`ACK mode: ${AUTO_ACK ? "automatic (noAck)" : "manual"}`);
  console.log("Waiting for tasks...");

  await channel.consume(
    QUEUE,
    async (message) => {
      if (message === null) {
        return;
      }

      const task = JSON.parse(message.content.toString());

      if (AUTO_ACK) {
        console.log(
          `Delivered and auto-acknowledged task ${task.id}; ` +
            "RabbitMQ does not expose it as unacked."
        );
        return;
      }

      console.log(
        `Delivered task ${task.id}; now UNACKED. ` +
          `Waiting ${ACK_DELAY_MS} ms before ACK...`
      );

      await new Promise((resolve) => setTimeout(resolve, ACK_DELAY_MS));

      channel.ack(message);
      console.log(`ACK task ${task.id}; message is now removed.`);
    },
    { noAck: AUTO_ACK }
  );
}

startConsumer().catch((error) => {
  console.error("Could not start consumer:", error.message);
  process.exitCode = 1;
});
