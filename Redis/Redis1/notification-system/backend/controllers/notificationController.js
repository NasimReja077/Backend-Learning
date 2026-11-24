import Notification from "../models/Notification.js";
import redisClient from "../config/redis.js";
import { sendNotification } from "../services/notificationService.js";

// Create notification
export const createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({
        message: "Recipient, title and message are required"
      });
    }

    const notification = await sendNotification({
      recipient,
      sender: req.userId,
      title,
      message,
      type
    });

    res.status(201).json({
      message: "Notification sent",
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name email");

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count with Redis caching
export const getUnreadCount = async (req, res) => {
  try {
    const cacheKey = `unread:${req.userId}`;

    const cachedCount = await redisClient.get(cacheKey);

    if (cachedCount !== null) {
      return res.json({
        unreadCount: Number(cachedCount),
        source: "Redis"
      });
    }

    const count = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false
    });

    await redisClient.set(cacheKey, String(count), {
      EX: 60
    });

    res.json({
      unreadCount: count,
      source: "MongoDB"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark one notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.userId
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    await redisClient.del(`unread:${req.userId}`);

    res.json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    await redisClient.del(`unread:${req.userId}`);

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};