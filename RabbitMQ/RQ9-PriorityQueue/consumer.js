const amqp = require("amqplib");

const QUEUE = "priority_tasks";
const MAX_PRIORITY = 10;

async function startConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
    maxPriority: MAX_PRIORITY,
  });
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
        console.log(
          `Processing ${task.id} (priority ${message.properties.priority}): ${task.name}`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
        channel.ack(message);
      } catch (error) {
        console.error("Could not process task:", error);
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );
}

startConsumer().catch((error) => {
  console.error("Could not start priority consumer:", error);
  process.exitCode = 1;
});
