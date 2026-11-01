const amqp = require("amqplib");

const receiveMessages = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    const queue = "order_queue";

    await channel.bindQueue(queue, exchange,"order.*");
    
    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });

    console.log("Waiting for messages");
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log(
            `[Order Notification] Msg was consumed! with rout`
          );
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

receiveMessages();