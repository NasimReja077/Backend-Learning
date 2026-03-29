import { Queue } from 'bullmq';

// const notificationQueue = new Queur('email-queue');
const notificationQueue = new Queue('email-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    }
});

async function init() {
    const job = await notificationQueue.add('email to nasim', {
        email: "nasim@gmail.com",
        subject: "Welcome to Dev",
        body: "Hey piyush, Welcome",
    });

    console.log("✅ Job added to Queue", job.id);
}

init().catch(console.error);


