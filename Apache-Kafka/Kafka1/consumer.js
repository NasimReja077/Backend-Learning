const { Kafka } = require('kafkajs');

const KAFKA_TOPIC = "demo-topic";
const GROUP_ID = "email-consumer-group";

// Initialize Kafka Consumer
const kafka = new Kafka({
    clientId: 'email-signup-consumer',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: GROUP_ID });

async function runConsumer() {
    try {
        await consumer.connect();
        console.log("Kafka Consumer connected successfully.");

        await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
        console.log(`Subscribed to topic: ${KAFKA_TOPIC}. Waiting for messages...`);

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const email = message.value.toString();
                console.log(`[Kafka Consumer] Received email -> Partition: ${partition} | Email: ${email}`);
                
                // You can perform downstream tasks here (e.g., send welcome email, save to database)
            },
        });
    } catch (error) {
        console.error("Error in Kafka consumer:", error);
    }
}

runConsumer();