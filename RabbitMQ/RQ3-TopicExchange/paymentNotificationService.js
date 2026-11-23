const amqp = require("amqplib");

const receiveMessages = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    const queue = "payment_queue";

    // Assert the exchange and queue, and bind the queue to the exchange with a routing key pattern
    await channel.assertExchange(exchange, "topic", { durable: true }); // Assert the exchange with type "topic" and durability
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, "payment.*");
    

    console.log("Waiting for messages");
    channel.consume( // Consume messages from the queue
      queue,
      (msg) => {
        if (msg !== null) {
          console.log(
            `[Payment Notification] Msg was consumed! with routing key as ${msg.fields.routingKey}: and content as ${msg.content.toString()}`
          );
          channel.ack(msg);// Acknowledge the message to remove it from the queue
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

receiveMessages();