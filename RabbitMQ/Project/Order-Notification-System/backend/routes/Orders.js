import express from "express";
import Order from "../models/Order.js";
import { getChannel } from "../config/rabbitmq.js";

const router = express.Router();

// Create Order
router.post("/", async (req, res) => {
  try {
    const { customerName, product, quantity } = req.body;

    // 1. Save order in MongoDB
    const order = await Order.create({
      customerName,
      product,
      quantity,
      status: "pending",
    });

    // 2. Publish message to RabbitMQ
    const channel = getChannel();
    const message = {
      orderId: order._id.toString(),
      customerName,
      product,
      quantity,
    };

    channel.sendToQueue(
      "order_notifications",
      Buffer.from(JSON.stringify(message)),
      { persistent: true } // message survives broker restart
    );

    console.log(`📤 Order published to queue: ${order._id}`);

    res.status(201).json({
      success: true,
      message: "Order created and notification queued",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;