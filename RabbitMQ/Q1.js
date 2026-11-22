const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'ecommerce_exchange';

// ==========================================
// অংশ ১: Consumer / Workers (রিসিভার)
// ==========================================
async function startWorkers() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

  const workers = [
    { queue: 'order_queue', bindingKey: 'order.created', task: 'New Order Saved' },
    { queue: 'inventory_queue', bindingKey: 'order.paid', task: 'Payment Verified & Stock Deducted' },
    { queue: 'shipping_queue', bindingKey: 'order.shipped', task: 'Package Handed to Courier' },
    { queue: 'delivery_queue', bindingKey: 'order.delivered', task: 'Order Delivered to Customer' }
  ];

  for (const w of workers) {
    await channel.assertQueue(w.queue, { durable: true });
    await channel.bindQueue(w.queue, EXCHANGE_NAME, w.bindingKey);

    channel.consume(w.queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log(`[${w.queue}] -> ${w.task} | Order ID: ${data.orderId}`);
        channel.ack(msg);
      }
    });
  }
}

// ==========================================
// অংশ ২: Producer (ইভেন্ট পাবলিশার)
// ==========================================
async function publishEvent(routingKey, orderData) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

  const payload = Buffer.from(JSON.stringify(orderData));
  channel.publish(EXCHANGE_NAME, routingKey, payload, { persistent: true });

  console.log(`Sent Event: '${routingKey}' for Order ${orderData.orderId}`);

  setTimeout(() => {
    channel.close();
    connection.close();
  }, 500);
}

// ==========================================
// অংশ ৩: পুরো ফ্লো চালানো (Run Flow)
// ==========================================
async function runOrderLifecycle() {
  await startWorkers();

  const sampleOrder = { orderId: 'ORD-101', item: 'Laptop', amount: 55000 };

  await publishEvent('order.created', sampleOrder);   // ধাপ ১: অর্ডার তৈরি
  await publishEvent('order.paid', sampleOrder);      // ধাপ ২: পেমেন্ট সম্পন্ন ও ইনভেন্টরি আপডেট
  await publishEvent('order.shipped', sampleOrder);   // ধাপ ৩: শিপিং শুরু
  await publishEvent('order.delivered', sampleOrder); // ধাপ ৪: ডেলিভারি সম্পন্ন
}

runOrderLifecycle().catch(console.error);
