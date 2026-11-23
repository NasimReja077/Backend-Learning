const amqp = require("amqplib");

const smsNotification = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "new_product_launch";
    const exchangeType = "fanout";

    // Assert the exchange with the specified type and durability
    await channel.assertExchange(exchange, exchangeType, { durable: true });

    const queue = await channel.assertQueue("", { exclusive: true }); // queue name ignored, exclusive queue will be created with a random name
    console.log("Waiting for msgs => ", queue);

    await channel.bindQueue(queue.queue, exchange, ""); // "" routing key is ignored for fanout exchange because it broadcasts messages to all bound queues

    // Consume messages from the queue
    channel.consume(queue.queue, (msg) => {
      if (msg !== null) {
        const product = JSON.parse(msg.content.toString());
        console.log("Sending SMS notification for product => ", product.name);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

smsNotification();