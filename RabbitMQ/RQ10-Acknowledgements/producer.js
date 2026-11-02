const amqp = require("amqplib");

const QUEUE = "acknowledgement_tasks";
const DEAD_LETTE_QUEUE = "acknowledgement_failed";
const queueOptions = {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": "",
    "x-dead-letter-routing-key": DEAD_LETTE_QUEUE,
  },
};

async function publishTasks() {
  const connection = await amqp.connect("amqp://localhost");
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(DEAD_LETTE_QUEUE, { durable: true });
    await channel.assertQueue(QUEUE, queueOptions);

    const tasks = [
      { id: "task-1", action: "send welcome email" },
      { id: "task-2", action: "simulate a processing failure", fail: true },
      { id: "task-3", action: "update customer record" },
    ];

    for (const task of tasks) {
      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)), {
        persistent: true,
        contentType: "application/json",
      });
      console.log(`Published ${task.id}`);
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
  console.error("Could not publish tasks:", error);
  process.exitCode = 1;
});
