const amqp = require('amqplib');

async function createAllQueueTypes() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // ==========================================
  // ১. Classic Queue (ডিফল্ট টাইপ)
  // ==========================================
  await channel.assertQueue('my_classic_queue', {
    durable: true,
    arguments: {
      'x-queue-type': 'classic', // না লিখলেও বাই-ডিফল্ট classic তৈরি হয়
      'x-max-priority': 10       // অপশনাল: মেসেজ প্রায়োরিটি সাপোর্ট
    }
  });
  console.log('1. Classic Queue created!');

  // ==========================================
  // ২. Quorum Queue (High Availability ও Data Safety)
  // ==========================================
  await channel.assertQueue('my_quorum_queue', {
    durable: true, // Quorum queue-এর জন্য durable: true বাধ্যতামূলক
    arguments: {
      'x-queue-type': 'quorum',
      'x-delivery-limit': 3 // মেসেজ ৩ বার ফেইল করলে আর রি-ট্রাই করবে না
    }
  });
  console.log('2. Quorum Queue created!');

  // ==========================================
  // ৩. Stream Queue (High Throughput ও Event Replay)
  // ==========================================
  await channel.assertQueue('my_stream_queue', {
    durable: true, // Stream queue-এর জন্য durable: true বাধ্যতামূলক
    arguments: {
      'x-queue-type': 'stream',
      'x-max-length-bytes': 2000000000 // অপশনাল: সর্বোচ্চ ২ GB ডেটা জমা রাখবে
    }
  });
  console.log('3. Stream Queue created!');

  await channel.close();
  await connection.close();
}

createAllQueueTypes().catch(console.error);
