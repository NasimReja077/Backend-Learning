import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { redisSubscriber } from "../config/redis.js";
import { getSecret } from "../config/secrets.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  // Authenticate socket connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        getSecret("JWT_SECRET")
      );

      socket.userId = decoded.userId;

      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const room = `user:${socket.userId}`;

    socket.join(room);

    console.log("User connected:", socket.userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  // Subscribe to Redis events
  redisSubscriber.subscribe("notifications", (message) => {
    const data = JSON.parse(message);

    io.to(`user:${data.recipient}`).emit(
      "newNotification",
      data.notification
    );
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};