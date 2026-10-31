const amqp = require("amqplib"); // Import the amqplib library to connect to RabbitMQ[cite: 1]

async function sendMail() { // Define an asynchronous function to handle message production[cite: 1]
  try {
    // create connection
    const connection = await amqp.connect("amqp://localhost"); // Establish a connection to the RabbitMQ server[cite: 1]
    // create channel
    const channel = await connection.createChannel(); // Create a communication channel[cite: 1]

    // create exchange
    const exchange = "mail_exchange"; // Define the exchange name[cite: 1]
    const routingKey = "send_mail"; // Define the routing key[cite: 1]
    const message = { // Define the payload object containing email details[cite: 1]
      to: "rahul@gmail.com",
      from: "harish@gmail.com",
      subject: "Hello TP mail",
      body: "Hello KAKA!!"
    };

    // create exchange using channel //type - direct, topic ,fanout, headers // durable: false - data lose
    await channel.assertExchange(exchange, "direct", { durable: false }); // Ensure the direct exchange exists[cite: 1, 2]
    // create Queue
    await channel.assertQueue("mail_queue", { durable: true }); // Ensure the target queue exists[cite: 1, 2]

    // bindQueue syntax -
    await channel.bindQueue("mail_queue", exchange, routingKey); // Bind the queue to the exchange using the routing key[cite: 1, 2]

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message))); // Publish the stringified message converted to a Buffer to the exchange[cite: 2]
    console.log("Mail data was sent", message); // Log success message along with the sent data[cite: 2]

    setTimeout(() => {
      connection.close(); // Close the connection after a short delay to ensure delivery[cite: 2]
    }, 500);

  } catch (error) {
    console.log(error); // Catch and log any errors that occur during execution[cite: 1, 2]
  }
}

sendMail(); // Invoke the sendMail function[cite: 1]