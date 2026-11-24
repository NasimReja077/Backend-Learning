import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";



import connectDB from "./config/db.js";
// import "./config/redis.js";
import redisClient from "./config/redis.js";

import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { initializeSocket } from "./socket/socket.js";

const startServer = async () => {
  await connectDB();

  const app = express();
  const server = http.createServer(app);

  app.use(cors({
    origin: process.env.CLIENT_URL
  }));

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "Notification API is running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.get("/api/redis-test", async (req, res) => {
  try {
    const pong = await redisClient.ping();

    res.json({
      success: true,
      message: "Redis Cloud connected!",
      response: pong
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

  initializeSocket(server);

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});