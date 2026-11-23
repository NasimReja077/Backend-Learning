const amqp = require("amqplib");

const QUEUE = process.env.RABBITMQ_QUEUE || "rq15_ready_unacked";
const TOTAL = Number(process.env.MESSAGE_COUNT || 12);

async function publishTasks() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    for (let id = 1; id <= TOTAL; id += 1) {
      const task = {
        id,
        action: `process task ${id}`,
        createdAt: new Date().toISOString(),
      };

      const published = channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(task)),
        {
          persistent: true,
          contentType: "application/json",
          messageId: `rq15-task-${id}`,
        }
      );

      if (!published) {
        await new Promise((resolve) => channel.once("drain", resolve));
      }

      console.log(`Published task ${id}`);
    }

    await channel.waitForConfirms();
    console.log(`Published ${TOTAL} confirmed tasks to "${QUEUE}".`);
  } finally {
    if (channel) {
      await channel.close();
    }
    await connection.close();
  }
}

publishTasks().catch((error) => {
  console.error("Could not publish tasks:", error.message);
  process.exitCode = 1;
});
