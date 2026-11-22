const amqp = require('amqplib');

async function setupAdvancedExchanges() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // ১. মেইন পাবলিক এক্সচেঞ্জ (Durable)
  await channel.assertExchange('main_gateway', 'topic', {
    durable: true,
    autoDelete: false
  });

  // ২. ইন্টারনাল এক্সচেঞ্জ (প্রোডিউসার সরাসরি এখানে মেসেজ পাঠাতে পারবে না)
  await channel.assertExchange('internal_orders', 'direct', {
    durable: true,
    internal: true
  });

  // ৩. Exchange-to-Exchange (E2E) Binding
  await channel.bindExchange('internal_orders', 'main_gateway', 'order.*');

  // ৪. ইন্টারনাল এক্সচেঞ্জের সাথে কিউ বাইন্ড করা
  await channel.assertQueue('payment_queue', { durable: true });
  await channel.bindQueue('payment_queue', 'internal_orders', 'order.paid');

  // ৫. প্রোডিউসার মেইন এক্সচেঞ্জে মেসেজ পাঠাবে -> সেটি ঘুরে payment_queue-তে পৌঁছাবে
  channel.publish(
    'main_gateway',
    'order.paid',
    Buffer.from(JSON.stringify({ orderId: 'ORD-505', status: 'PAID' })),
    { persistent: true }
  );

  console.log('Message routed via Exchange-to-Exchange binding!');

  setTimeout(async () => {
    await channel.close();
    await connection.close();
  }, 500);
}

setupAdvancedExchanges().catch(console.error);
