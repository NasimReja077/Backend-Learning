const amqp = require("amqplib");

const QUEUE = "durable_jobs";

async function publishJob() {
  const connection = await amqp.connect("amqp://localhost");
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    const job = {
      id: `job-${Date.now()}`,
      action: "rebuild customer search index",
      createdAt: new Date().toISOString(),
    };

    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
      persistent: true,
      contentType: "application/json",
    });

    await channel.waitForConfirms();
    console.log(`Broker confirmed ${job.id}`);
  } finally {
    if (channel) {
      await channel.close();
    }
    await connection.close();
  }
}

publishJob().catch((error) => {
  console.error("Could not publish durable job:", error);
  process.exitCode = 1;
});
