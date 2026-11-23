const amqp = require("amqplib");

const consumeNewVideoNotifications = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "header_exchange";
    const exchangeType = "headers";

    await channel.assertExchange(exchange, exchangeType, { durable: true });

    const q = await channel.assertQueue("", { exclusive: true }); // "" is used as the routing key for header exchanges // ignore the routing key for header exchanges
    console.log("Waiting for new video notifications");

    await channel.bindQueue(q.queue, exchange, "", { // exchange is the name of the exchange to bind the queue to, q.queue is the name of the queue to bind, "" is used as the routing key for header exchanges, and the last parameter is an object that specifies the headers to match for binding. In this case, we are using "x-match": "all" to indicate that all specified headers must match for a message to be routed to this queue. The headers we are matching are "notification-type": "new_video" and "content-type": "video". This means that only messages with these specific headers will be routed to this queue.
      "x-match": "all",
      "notification-type": "new_video",
      "content-type": "video"
    });

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const message = msg.content.toString();
        console.log("Received new video notification", message);
        // Notification code yaha par ayega!
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

consumeNewVideoNotifications();