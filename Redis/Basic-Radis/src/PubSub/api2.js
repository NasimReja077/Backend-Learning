
import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Publisher Redis connection
const publisher = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

const CHANNEL = "notifications";

// Publish notification
app.post("/notifications", async (req, res) => {
    try {
        const { title, message, type } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Notification message is required"
            });
        }

        const payload = {
            id: crypto.randomUUID(),
            title: title || "New Notification",
            message,
            type: type || "info",
            createdAt: new Date().toISOString()
        };

        // Publish message to Redis
        const receivers = await publisher.publish(
            CHANNEL,
            JSON.stringify(payload)
        );

        return res.status(200).json({
            success: true,
            message: "Notification published",
            subscribersReached: receivers,
            notification: payload
        });

    } catch (error) {
        console.error("Publish error:", error);

        return res.status(500).json({
            message: "Failed to publish notification"
        });
    }
});

// Publish an order event on a different channel
app.post("/orders", async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const event = {
            event: "ORDER_CREATED",
            orderId,
            amount,
            createdAt: new Date().toISOString()
        };

        const receivers = await publisher.publish(
            "orders:created",
            JSON.stringify(event)
        );

        res.json({
            message: "Order event published",
            subscribersReached: receivers
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
