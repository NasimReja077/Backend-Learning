const amqp = require("amqplib"); 

async function recvMail() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue("subscribed_users_mail_queue", { durable: true });

    channel.consume("subscribed_users_mail_queue", (message) => { 
      if (message !== null) {
        console.log("Recv message for Sub user ", JSON.parse(message.content));
        channel.ack(message);
      }
    });

  } catch (error) {
    console.error("Subscribed-user consumer failed:", error);
    process.exitCode = 1;
  }
}

recvMail(); // Invoke the recvMail function[cite: 3]