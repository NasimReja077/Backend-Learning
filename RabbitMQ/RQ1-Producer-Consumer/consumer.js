const amqp = require("amqplib"); // Import the amqplib library to connect to RabbitMQ[cite: 3]

async function recvMail() { // Define an asynchronous function to handle message consumption[cite: 3]
  try {
    const connection = await amqp.connect("amqp://localhost"); // Establish a connection to the RabbitMQ server[cite: 3]
    const channel = await connection.createChannel(); // Create a communication channel[cite: 3]

    await channel.assertQueue("mail_queue", { durable: true }); // Ensure the target queue exists[cite: 3]

    channel.consume("mail_queue", (message) => { // Start consuming messages from the queue[cite: 3]
      if (message !== null) { // Check if the received message is valid[cite: 3]
        console.log("Recv message ", JSON.parse(message.content)); // Parse the message content from Buffer to object and log it[cite: 3]
        channel.ack(message); // Acknowledge successful processing of the message[cite: 3]
      }
    });

  } catch (error) {
    console.log(error); // Catch and log any errors that occur during execution[cite: 3]
  }
}

recvMail(); // Invoke the recvMail function[cite: 3]