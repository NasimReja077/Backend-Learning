const amqp = require("amqplib");

const QUEUE = "image_resize_jobs";

async function publishJobs() {
  const connection = await amqp.connect("amqp://localhost");
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    for (let id = 1; id <= 12; id += 1) {
      const job = {
        id: `image-${id}`,
        operation: "resize",
        width: 800,
      };
      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
        persistent: true,
        contentType: "application/json",
      });
      console.log(`Queued ${job.id}`);
    }

    await channel.waitForConfirms();
  } finally {
    if (channel) {
      await channel.close();
    }
    await connection.close();
  }
}

publishJobs().catch((error) => {
  console.error("Could not publish jobs:", error);
  process.exitCode = 1;
});
