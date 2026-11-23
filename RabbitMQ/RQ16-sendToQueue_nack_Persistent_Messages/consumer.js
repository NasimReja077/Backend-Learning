const amqp = require("amqplib");

const QUEUE = process.env.RABBITMQ_QUEUE || "rq16_persistent_jobs";
const DLQ = `${QUEUE}_dlq`;
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);

async function startConsumer() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const channel = await connection.createConfirmChannel();

  // Ensure both the main queue and the dead-letter queue exist
  await channel.assertQueue(DLQ, { durable: true });
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: { 
      "x-dead-letter-exchange": "", // Use the default exchange for dead-lettering
      "x-dead-letter-routing-key": DLQ, // Route messages to the dead-letter queue
    },
  });
  await channel.prefetch(1);

  console.log(`Queue: ${QUEUE}`);
  console.log(`Dead-letter queue: ${DLQ}`);
  console.log(`Maximum retries: ${MAX_RETRIES}`);
  console.log("Waiting for persistent jobs...");

  await channel.consume(
    QUEUE,
    async (message) => {
      if (message === null) {
        return;
      }

      const job = JSON.parse(message.content.toString());
      const retryCount = Number(message.properties.headers?.["x-retry-count"] || 0);

      try {
        console.log(
          `Processing ${job.id}; retryCount=${retryCount}; ` +
            `deliveryTag=${message.fields.deliveryTag}`
        );
//       Simulate job processing based on the behavior specified in the job
        if (job.behavior === "fail_once" && retryCount === 0) {
          throw new Error("Temporary processing failure");
        }
//      Simulate a permanent failure for jobs with behavior "permanent_failure"
        if (job.behavior === "permanent_failure") {
          throw new Error("Permanent validation failure");
        }
//     Simulate successful processing for jobs with behavior "success"
        await new Promise((resolve) => setTimeout(resolve, 300));
        channel.ack(message);
        console.log(`ACK: ${job.id} completed successfully`);
      } catch (error) {
        const nextRetryCount = retryCount + 1;

        if (
          job.behavior === "fail_once" &&
          nextRetryCount <= MAX_RETRIES
        ) {
          console.log(
            `NACK requeue=true: ${job.id}; retry ${nextRetryCount}/${MAX_RETRIES}`
          );

          const requeuedMessage = Buffer.from(JSON.stringify(job));
          channel.nack(message, false, false);

          await new Promise((resolve) => setTimeout(resolve, 500));
          channel.sendToQueue(QUEUE, requeuedMessage, {
            persistent: true,
            contentType: "application/json",
            messageId: job.id,
            headers: {
              "x-retry-count": nextRetryCount,
            },
          });
          await channel.waitForConfirms();
          return;
        }

        console.log(
          `NACK requeue=false: ${job.id}; sending to "${DLQ}"`
        );
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );
}

startConsumer().catch((error) => {
  console.error("Could not start consumer:", error.message);
  process.exitCode = 1;
});
