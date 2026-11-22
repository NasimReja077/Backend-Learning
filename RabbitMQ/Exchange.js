const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'payment_direct_exchange';

async function runDirectExchangeDemo() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  // ১. Direct Exchange তৈরি করা
  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

  // ২. কিউগুলো তৈরি করা
  await channel.assertQueue('billing_queue', { durable: true });
  await channel.assertQueue('receipt_email_queue', { durable: true });
  await channel.assertQueue('failed_payment_queue', { durable: true });

  // ৩. Binding Key দিয়ে কিউ যুক্ত করা
  // একই Binding Key ('payment.success') দুটি কিউতে যুক্ত করা হলো
  await channel.bindQueue('billing_queue', EXCHANGE_NAME, 'payment.success');
  await channel.bindQueue('receipt_email_queue', EXCHANGE_NAME, 'payment.success');

  // আলাদা Binding Key ('payment.failed') অন্য কিউতে যুক্ত করা হলো
  await channel.bindQueue('failed_payment_queue', EXCHANGE_NAME, 'payment.failed');

  // ৪. Consumer / Workers চালু করা
  const queues = ['billing_queue', 'receipt_email_queue', 'failed_payment_queue'];
  for (const q of queues) {
    channel.consume(q, (msg) => {
      if (msg) {
        console.log(`[${q}] Received (${msg.fields.routingKey}):`, msg.content.toString());
        channel.ack(msg);
      }
    });
  }

  // ৫. Producer থেকে মেসেজ পাঠানো (Exact Routing Key)
  channel.publish(
    EXCHANGE_NAME,
    'payment.success',
    Buffer.from(JSON.stringify({ orderId: 'ORD-201', amount: 1500 })),
    { persistent: true }
  );

  channel.publish(
    EXCHANGE_NAME,
    'payment.failed',
    Buffer.from(JSON.stringify({ orderId: 'ORD-202', reason: 'Insufficient balance' })),
    { persistent: true }
  );

  setTimeout(async () => {
    await channel.close();
    await connection.close();
  }, 1000);
}

runDirectExchangeDemo().catch(console.error);
