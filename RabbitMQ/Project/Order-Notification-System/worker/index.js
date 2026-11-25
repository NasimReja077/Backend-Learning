import amqp from "amqplib";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../backend/.env" }); // reuse same .env

// Simple Order model (same as backend)
const orderSchema = new mongoose.Schema(
  {
    customerName: String,
    product: String,
    quantity: Number,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

const QUEUE_NAME = "order_notifications";

async function startWorker() {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Worker connected to MongoDB");

    // Connect RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Fair dispatch - only give 1 message at a time
    channel.prefetch(1);

    console.log("👷 Worker is waiting for messages...");

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          console.log("\n📥 Received job:", data);

          // Simulate processing time (email sending, etc.)
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Update order status
          await Order.findByIdAndUpdate(data.orderId, {
            status: "completed",
          });

          console.log(`✅ Notification sent for Order: ${data.orderId}`);
          console.log(`   Customer: ${data.customerName}`);
          console.log(`   Product : ${data.product}`);

          // Acknowledge message (remove from queue)
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Error processing message:", error.message);

          // Reject and requeue (or send to dead-letter later)
          channel.nack(msg, false, true); // requeue = true
        }
      },
      { noAck: false } // manual acknowledgment
    );
  } catch (error) {
    console.error("Worker failed:", error);
    process.exit(1);
  }
}

startWorker();