const amqp = require("amqplib");

const QUEUE = "priority_tasks";
const MAX_PRIORITY = 10;

const tasks = [
  { id: "report-1", name: "Generate weekly report", priority: 1 },
  { id: "email-1", name: "Send newsletter", priority: 2 },
  { id: "payment-1", name: "Verify urgent payment", priority: 9 },
  { id: "incident-1", name: "Handle production incident", priority: 10 },
  { id: "report-2", name: "Export analytics", priority: 4 },
];

async function publishTasks() {
  const connection = await amqp.connect("amqp://localhost");
  let channel;

  try {
    channel = await connection.createConfirmChannel();
    await channel.assertQueue(QUEUE, {
      durable: true,
      maxPriority: MAX_PRIORITY,
    });

    for (const task of tasks) {
      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)), {
        persistent: true,
        priority: task.priority,
        contentType: "application/json",
      });
      console.log(`Queued ${task.id} with priority ${task.priority}`);
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
  console.error("Could not publish priority tasks:", error);
  process.exitCode = 1;
});