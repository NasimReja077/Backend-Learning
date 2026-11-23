const amqp = require("amqplib");

const QUEUE = process.env.RABBITMQ_QUEUE || "rq16_persistent_jobs";
const DLQ = `${QUEUE}_dlq`;

async function publishJobs() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(DLQ, { durable: true });
    await channel.assertQueue(QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ,
      },
    });

    // Define the jobs to be published with different behaviors
    const jobs = [
      {
        id: "job-1",
        action: "generate invoice",
        behavior: "success",
      },
      {
        id: "job-2",
        action: "temporary payment verification",
        behavior: "fail_once",
      },
      {
        id: "job-3",
        action: "send permanent invalid task",
        behavior: "permanent_failure",
      },
    ];

    // Publish jobs to the queue with persistent messages
    for (const job of jobs) {
      const sent = channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(job)),
        {
          persistent: true,
          contentType: "application/json",
          messageId: job.id,
          timestamp: Math.floor(Date.now() / 1000),
        }
      );

      if (!sent) {
        await new Promise((resolve) => channel.once("drain", resolve));
      }

      console.log(`sendToQueue() submitted persistent ${job.id}`);
    }

    await channel.waitForConfirms();
    console.log(`RabbitMQ confirmed all persistent publishes to "${QUEUE}".`);
  } finally {
    if (channel) {
      await channel.close();
    }
    await connection.close();
  }
}

publishJobs().catch((error) => {
  console.error("Could not publish persistent jobs:", error.message);
  process.exitCode = 1;
});
