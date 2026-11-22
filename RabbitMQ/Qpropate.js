const amqp = require('amqplib');

async function setupQueuesWithProperties() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // ১. প্রোডাকশন কিউ: Durable + Message TTL + Max Length + Max Size
  await channel.assertQueue('orders_bounded_queue', {
    durable: true,       // সার্ভার রিস্টার্টেও থাকবে
    exclusive: false,    // সব কানেকশন ব্যবহার করতে পারবে
    autoDelete: false,   // কনজিউমার না থাকলেও ডিলিট হবে না
    arguments: {
      'x-message-ttl': 60000,          // ৬০ সেকেন্ড পর মেসেজ এক্সপায়ার হবে
      'x-max-length': 1000,            // সর্বোচ্চ ১০০০টি মেসেজ থাকবে
      'x-max-length-bytes': 10485760,  // সর্বোচ্চ 10 MB ডেটা থাকবে
      'x-overflow': 'drop-head'        // সীমা পূর্ণ হলে সবচেয়ে পুরনো মেসেজ বাদ যাবে
    }
  });
  console.log('1. Bounded Production Queue created!');

  // ২. অস্থায়ী সেশন কিউ: Auto-expire (অলস থাকলে ৩০ সেকেন্ড পর ডিলিট)
  await channel.assertQueue('temp_otp_queue', {
    durable: false,
    arguments: {
      'x-expires': 30000,      // ৩০ সেকেন্ড কিউ অব্যবহৃত থাকলে কিউটিই ডিলিট হবে
      'x-message-ttl': 15000   // প্রতিটি OTP মেসেজ ১৫ সেকেন্ড পর মুছে যাবে
    }
  });
  console.log('2. Auto-expiring OTP Queue created!');

  // ৩. প্রাইভেট RPC রিপ্লাই কিউ: Exclusive + Auto-delete
  const rpcReply = await channel.assertQueue('', {
    exclusive: true,   // শুধু এই কানেকশনের জন্য সংরক্ষিত ও ইউনিক নাম পাবে
    autoDelete: true   // কনজিউমার বন্ধ হলেই ডিলিট হবে
  });
  console.log(`3. Exclusive RPC Queue created: ${rpcReply.queue}`);

  setTimeout(async () => {
    await channel.close();
    await connection.close(); // কানেকশন বন্ধ হওয়ামাত্র Exclusive কিউটি ডিলিট হয়ে যাবে
  }, 1000);
}

setupQueuesWithProperties().catch(console.error);
