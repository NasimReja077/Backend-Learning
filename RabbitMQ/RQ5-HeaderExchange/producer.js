const amqp = require("amqplib");

const sendNotification = async (headers, message) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "header_exchange";
    const exchangeType = "headers";

    await channel.assertExchange(exchange, exchangeType, { durable: true });

    channel.publish(exchange, "", Buffer.from(message), {
      persistent: true,
      headers,
    });

    console.log(" Sent notification with headers");

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
};

const publishExamples = async () => {
  await sendNotification(
    { "notification-type": "new_video", "content-type": "video" },
    "New music video uploaded"
  );
  await sendNotification(
    { "notification-type": "live_stream", "content-type": "gaming" },
    "Gaming live stream started"
  );
  await sendNotification(
    { "notification-type-comment": "comment", "content-type": "vlog" },
    "New comment on your vlog"
  );
  await sendNotification(
    { "notification-type-like": "like", "content-type": "vlog" },
    "New like on your vlog"
  );
};

publishExamples();