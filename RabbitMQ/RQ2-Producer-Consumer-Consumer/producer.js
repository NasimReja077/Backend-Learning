const amqp = require("amqplib");

async function sendMail() {
  const connection = await amqp.connect("amqp://localhost");

  try {
    const channel = await connection.createConfirmChannel();
    const exchange = "mail_exchange";
    const subscribedQueue = "subscribed_users_mail_queue";
    const usersQueue = "users_mail_queue";
    const routingKeyForSubUser = "send_mail_to_subscribed_users";
    const routingKeyForNormalUser = "send_mail_to_users";
    const message = {
      to: "moglu@gmail.com",
      from: "pituse@gmail.com",
      subject: "Hola TP mail",
      body: "Hello PaPe!"
    };
    const content = Buffer.from(JSON.stringify(message));

    await channel.assertExchange(exchange, "direct", { durable: false });
    await channel.assertQueue(subscribedQueue, { durable: true });
    await channel.assertQueue(usersQueue, { durable: true });

    await channel.bindQueue(subscribedQueue, exchange, routingKeyForSubUser);
    await channel.bindQueue(usersQueue, exchange, routingKeyForNormalUser);

    channel.publish(exchange, routingKeyForSubUser, content, { persistent: true });
    channel.publish(exchange, routingKeyForNormalUser, content, { persistent: true });
    await channel.waitForConfirms();

    console.log("Mail data was sent to both user groups", message);
  } finally {
    await connection.close();
  }
}

sendMail().catch((error) => {
  console.error("Failed to send mail:", error);
  process.exitCode = 1;
});
