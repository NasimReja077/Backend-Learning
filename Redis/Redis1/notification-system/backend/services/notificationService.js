import Notification from "../models/Notification.js";
import redisClient from "../config/redis.js";

export const sendNotification = async ({
  recipient,
  sender,
  title,
  message,
  type
}) => {
  // 1. Save notification permanently in MongoDB
  const notification = await Notification.create({
    recipient,
    sender,
    title,
    message,
    type
  });

  // 2. Clear unread count cache
  await redisClient.del(`unread:${recipient}`);

  // 3. Publish event to Redis
  await redisClient.publish(
    "notifications",
    JSON.stringify({
      recipient: recipient.toString(),
      notification: notification.toObject()
    })
  );

  return notification;
};