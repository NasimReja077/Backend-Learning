
const amqp = require("amqplib");

const QUEUE = "email_queue";

let connection;
let channel;

const connectRabbitMQ = async () => {
  connection = await amqp.connect(process.env.RABBITMQ_URL);

  channel = await connection.createConfirmChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
  });

  console.log("RabbitMQ Connected");

  connection.on("error", (error) => {
    console.error("RabbitMQ Error:", error);
  });
};

const publishToQueue = async (data) => {
  if (!channel) {
    throw new Error("RabbitMQ is not connected");
  }

  return new Promise((resolve, reject) => {
    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
        contentType: "application/json",
      },
      (error) => {
        if (error) return reject(error);
        resolve();
      }
    );
  });
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
};
