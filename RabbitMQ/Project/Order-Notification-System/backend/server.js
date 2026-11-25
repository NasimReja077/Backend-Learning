import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);

const startServer = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Connect RabbitMQ
    await connectRabbitMQ();

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();