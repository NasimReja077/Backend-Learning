const amqp = require("amqplib");

const QUEUE = "image_resize_jobs";
const workerName = process.argv[2] || `worker-${process.pid}`;

async function startWorker() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  await channel.prefetch(1);
  console.log(`${workerName} waiting for jobs in ${QUEUE}`);

  await channel.consume(
    QUEUE,
    async (message) => {
      if (message === null) {
        return;
      }

      try {
        const job = JSON.parse(message.content.toString());
        console.log(`${workerName} processing ${job.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        channel.ack(message);
        console.log(`${workerName} completed ${job.id}`);
      } catch (error) {
        console.error(`${workerName} failed to process a job:`, error);
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );
}

startWorker().catch((error) => {
  console.error(`Could not start ${workerName}:`, error);
  process.exitCode = 1;
});
