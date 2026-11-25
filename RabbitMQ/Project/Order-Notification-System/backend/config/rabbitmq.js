import amqp from "amqplib";

let channel = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Create queue (idempotent)
    await channel.assertQueue("order_notifications", {
      durable: true, // survive broker restart
    });

    console.log("✅ Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("❌ RabbitMQ connection error:", error.message);
    process.exit(1);
  }
};

export const getChannel = () => channel;