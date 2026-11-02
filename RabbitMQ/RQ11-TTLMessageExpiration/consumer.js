const amqp = require("amqplib");

const EXPIRED_QUEUE = "expired_tasks";

async function consumeExpiredTasks() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(EXPIRED_QUEUE, { durable: true });
  await channel.prefetch(1);
  console.log(`Waiting for expired messages in ${EXPIRED_QUEUE}`);

  await channel.consume(
    EXPIRED_QUEUE,
    (message) => {
      if (message === null) {
        return;
      }

      console.log(`Expired task: ${message.content.toString()}`);
      channel.ack(message);
    },
    { noAck: false }
  );
}

consumeExpiredTasks().catch((error) => {
  console.error("Could not consume expired tasks:", error);
  process.exitCode = 1;
});
