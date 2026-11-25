
require("dotenv").config();

const amqp = require("amqplib");

const {
  sendOTPEmail,
  sendWelcomeEmail,
} = require("../services/email.service");

const QUEUE = "email_queue";

const startWorker = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL
  );

  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
  });

  // Process maximum 5 unacknowledged messages
  channel.prefetch(5);

  console.log("Email Worker Started");

  channel.consume(QUEUE, async (message) => {
    if (!message) return;

    try {
      const data = JSON.parse(
        message.content.toString()
      );

      console.log("Processing:", data.type);

      switch (data.type) {
        case "OTP":
          await sendOTPEmail(data.email, data.otp);
          break;

        case "WELCOME":
          await sendWelcomeEmail(data.email);
          break;

        default:
          throw new Error("Unknown email type");
      }

      // Message processed successfully
      channel.ack(message);

      console.log("Email Job Completed");
    } catch (error) {
      console.error("Email Job Failed:", error.message);

      // Reject without infinite requeue loop
      channel.nack(message, false, false);
    }
  });
};

startWorker().catch(console.error);
