const amqp = require("amqplib");

const QUEUE = "durable_jobs";

async function startConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  await channel.prefetch(1);
  console.log(`Waiting for durable jobs in ${QUEUE}`);

  await channel.consume(
    QUEUE,
    (message) => {
      if (message === null) {
        return;
      }

      try {
        const job = JSON.parse(message.content.toString());
        console.log(`Processing ${job.id}: ${job.action}`);
        channel.ack(message);
      } catch (error) {
        console.error("Invalid job payload; rejecting:", error);
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );
}

startConsumer().catch((error) => {
  console.error("Could not start durable-job consumer:", error);
  process.exitCode = 1;
});
