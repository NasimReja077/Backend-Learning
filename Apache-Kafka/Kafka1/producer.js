const express = require('express');
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const KAFKA_TOPIC = "demo-topic";
const EMAIL_FILE = path.join(__dirname, "emails.txt");

// Initialize Kafka Producer
const kafka = new Kafka({
    clientId: 'email-signup-producer',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function startProducer() {
    try {
        await producer.connect();
        console.log("Kafka Producer connected successfully.");

        app.listen(PORT, () => {
            console.log(`Producer API running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect Kafka producer:", error);
    }
}

app.post('/api/signup', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || email.toLowerCase() === 'exit') {
            return res.status(400).json({ error: "Invalid email address." });
        }

        const trimmedEmail = email.trim();

        // Save locally to file
        fs.appendFileSync(EMAIL_FILE, trimmedEmail + "\n", "utf-8");

        // Send to Kafka topic
        await producer.send({
            topic: KAFKA_TOPIC,
            messages: [{ value: trimmedEmail }],
        });

        console.log(`Sent email ${trimmedEmail} to Kafka topic ${KAFKA_TOPIC}`);
        return res.status(200).json({ success: true, message: `Email ${trimmedEmail} sent to Kafka!` });

    } catch (error) {
        console.error("Error in signup endpoint:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

startProducer();