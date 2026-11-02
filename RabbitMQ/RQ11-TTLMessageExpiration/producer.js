const amqp = require("amqplib");

const SOURCE_QUEUE = "ttl_tasks";
const EXPIRED_QUEUE = "expired_tasks";
const TTL_MS = 10000;
const sourceQueueOptions = {
  durable: true,
  messageTtl: TTL_MS,
  deadLetterExchange: "",
  deadLetterRoutingKey: EXPIRED_QUEUE,
};

async function publishTasks() {
  const connection = await amqp.connect("amqp://localhost");
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(EXPIRED_QUEUE, { durable: true });
    await channel.assertQueue(SOURCE_QUEUE, sourceQueueOptions);

    for (const id of ["reminder-1", "reminder-2", "reminder-3"]) {
      const task = { id, action: "send reminder after expiry" };
      channel.sendToQueue(SOURCE_QUEUE, Buffer.from(JSON.stringify(task)), {
        persistent: true,
        contentType: "application/json",
      });
      console.log(`Published ${id}; expires after ${TTL_MS} ms`);
    }

    await channel.waitForConfirms();
  } finally {
    if (channel) {
      await channel.close();
    }
    await connection.close();
  }
}

publishTasks().catch((error) => {
  console.error("Could not publish TTL tasks:", error);
  process.exitCode = 1;
});
