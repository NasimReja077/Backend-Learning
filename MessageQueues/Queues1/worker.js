import { Worker } from 'bullmq';

const sendEmail = () => new Promise((resolve) => 
    setTimeout(() => resolve(), 5000)
);

const worker = new Worker('email-queue', async (job) => {
    console.log(`📨 Processing job: ${job.id}`);
    console.log(`Sending email to ${job.data.email}`);

    await sendEmail();

    console.log(`✅ Email Sent for job ${job.id}`);
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    }
});

console.log('🚀 Worker started...');

// Graceful shutdown
process.on('SIGTERM', async () => {
    await worker.close();
    console.log('Worker closed');
});



// const { Worker } = require("bullmq");

// const sendEmail = () => new Promise((res, rej) => setTimeout(() => res(), 5*1000))

// const worker = new Worker("email-quue", async (job) => {
//      console.log(`Message rec id: ${job.id}`);
//      console.log("Processsing message");
//      console.log(`Sending email to ${job.data.email}`);
//      // return new Promise((res, rej) => setTimeout(() => res(), 5*1000));
//      await sendEmail();
//      console.log("Email Sent");
// });


