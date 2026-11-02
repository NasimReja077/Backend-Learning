const amqp = require("amqplib");

const QUEUE = "acknowledgement_tasks";
const DEAD_LETTE_QUEUE = "acknowledgement_failed";
const queueOptions = {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": "",
    "x-dead-letter-routing-key": DEAD_LETTE_QUEUE,
  },
};

async function startConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(DEAD_LETTE_QUEUE, { durable: true });
  await channel.assertQueue(QUEUE, queueOptions);
  await channel.prefetch(1);
  console.log(`Waiting for tasks in ${QUEUE}`);

  await channel.consume(
    QUEUE,
    async (message) => {
      if (message === null) {
        return;
      }

      try {
        const task = JSON.parse(message.content.toString());
        console.log(`Processing ${task.id}: ${task.action}`);

        if (task.fail) {
          throw new Error("Intentional example failure");
        }

        channel.ack(message);
        console.log(`Acknowledged ${task.id}`);
      } catch (error) {
        console.error("Task failed; rejecting without requeue:", error.message);
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );
}

startConsumer().catch((error) => {
  console.error("Could not start consumer:", error);
  process.exitCode = 1;
});
