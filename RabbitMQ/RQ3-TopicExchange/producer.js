const amqp = require("amqplib");

const publishNotification = async (routingKey, notification) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "notification_exchange";
    const exchangeType = "topic";

    await channel.assertExchange(exchange, exchangeType, { durable: true }); // Assert the exchange with type "topic" and durability

    const message = JSON.stringify(notification);

    channel.publish(exchange, routingKey, Buffer.from(message), { persistent: true });
    // console.log(`Sent ${routingKey} => ${message}`);
    console.log(" [x] Sent '%s':'%s'", routingKey, message);
    console.log(`Message was sent! with routing key as ${routingKey} and content as ${message}`);


    // await channel.close();
    // await connection.close();

    setTimeout(() =>{
      connection.close();
    }, 500);  // Close the connection after a short delay to ensure the message is sent
  } catch (error) {
    console.error("Error:", error);
    // process.exitCode = 1;
  }
};

// const publishExamples = async () => {
//   await publishNotification("order.created", {
//     orderId: 123,
//     customerId: 45,
//   });
//   await publishNotification("payment.completed", {
//     orderId: 123,
//     amount: 200000,
//   });
// };

// publishExamples();

sendMessage("order.placed", { orderId: 12345, status: "placed" });
sendMessage("payment.completed", {
  paymentId: 67890,
  status: "processed",
});