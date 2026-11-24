import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createNotification);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;