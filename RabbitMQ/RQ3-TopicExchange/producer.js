const amqp = require("amqplib");

const publishNotification = async (routingKey, notification) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "notification_exchange";

    await channel.assertExchange(exchange, "topic", { durable: true });

    const message = JSON.stringify(notification);

    channel.publish(exchange, routingKey, Buffer.from(message), {
      persistent: true,
    });
    console.log(`Sent ${routingKey} => ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
};

const publishExamples = async () => {
  await publishNotification("order.created", {
    orderId: 123,
    customerId: 45,
  });
  await publishNotification("payment.completed", {
    orderId: 123,
    amount: 200000,
  });
};

publishExamples();