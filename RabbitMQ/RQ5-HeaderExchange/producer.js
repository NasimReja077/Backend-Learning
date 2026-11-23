const amqp = require("amqplib");

const sendNotification = async (headers, message) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "header_exchange";
    const exchangeType = "headers";

    await channel.assertExchange(exchange, exchangeType, { durable: true });

    // Publish the message to the exchange with the specified headers
    // publish -> exchange, routingKey, content, options, header before the message is sent to the exchange, we can set the headers for the message in the options parameter of the publish method. The headers are passed as an object in the options parameter, and they will be included in the message properties when it is sent to the exchange.
    channel.publish(exchange, "", Buffer.from(message), { // "" is used as the routing key for header exchanges // ignore the routing key for header exchanges
      persistent: true, // Make the message persistent
      headers, // Set the headers for the message
    });

    console.log(" Sent notification with headers");

    // await channel.close();
    // await connection.close();

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error:", error);
    // process.exitCode = 1;
  }
};

// const publishExamples = async () => {
//   await sendNotification(
//     { 
//       "notification-type": "new_video", 
//       "content-type": "video" 
//     }, "New music video uploaded"
//   );
//   await sendNotification(
//     { 
//       "notification-type": "live_stream", 
//       "content-type": "gaming" 
//     },
//     "Gaming live stream started"
//   );
//   await sendNotification(
//     { 
//       "notification-type-comment": "comment", 
//       "content-type": "vlog" 
//     },
//     "New comment on your vlog"
//   );
//   await sendNotification(
//     { 
//       "notification-type-like": "like", 
//       "content-type": "vlog" 
//     },
//     "New like on your vlog"
//   );
// };

// publishExamples();


sendNotification({ "x-match": "all", "notification-type":"new_video", "content-type":"video" }, "New music video uploaded");
sendNotification({ "x-match": "all", "notification-type":"live_stream", "content-type":"gaming" }, "Gaming live stream started");
sendNotification({ "x-match": "any", "notification-type-comment":"comment", "content-type":"vlog" }, "New comment on your vlog");
sendNotification({ "x-match": "any", "notification-type-like":"like", "content-type":"vlog" }, "New like on your vlog");


// All & Any code Implementatio explanation:
// In the above code, we have implemented a producer that sends notifications to a header exchange in RabbitMQ. The producer connects to the RabbitMQ server, creates a channel, and asserts a header exchange named "header_exchange".
// The sendNotification function takes headers and a message as parameters. It publishes the message to the exchange with the specified headers, making it persistent. The publishExamples function demonstrates sending different types of notifications with various headers, such as new video uploads, live streams, comments, and likes. Each notification is sent with its corresponding headers to allow consumers to filter messages based on their interests.
// example, a consumer can bind a queue to the header exchange with specific header values to receive only the notifications they are interested in, such as new video uploads or live streams. This allows for flexible message routing based on headers, enabling consumers to receive only relevant messages.
// 

// Exchange type: Headers
// In RabbitMQ, a header exchange is a type of exchange that routes messages based on the headers of the message rather than the routing key. When a message is published to a header exchange, it can contain multiple headers, and consumers can bind their queues to the exchange with specific header values. The exchange will then route messages to the queues that match the specified header values, allowing for more flexible and complex routing scenarios compared to direct or topic exchanges.
// 