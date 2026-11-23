// topic name: queue explanation for lpush, rpop, lrange, lindex, lrem, ltrim, blpop, brpop, lmove
// it covers the basic queue operations in Redis using lists. The code below demonstrates how to implement a simple email queue system using Redis and Express.js.

import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = 'queue:emails';

app.post('/emails', async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject || 'No subject',
        body: req.body.body || 'No content',
        createdAt: new Date().toISOString()
    }
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.json({queued: true, job});
});

app.get("/emails/process-one", async (req, res) => {
    const rawJob = await redis.rpop(QUEUE_KEY);
    if (!rawJob) {
        return res.json({ message: "No jobs in the queue" });
    }
    const job = JSON.parse(rawJob);
    // Simulate email sending
    res.json({ message: "Email sent", job });
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});


// problem 
// job lose
// retry system
// parallel worker



/**
 * 4. Understand all important Redis List methods

Redis       command	Purpose	        ioredis method    when to use

LPUSH	    Add item to left	    redis.lpush()   if you want to add a new job to the front of the queue, use LPUSH. This is useful for high-priority jobs that need to be processed before others.
RPUSH	    Add item to right	    redis.rpush()    ''''' end of the queue, use RPUSH. This is useful for low-priority jobs that can wait until other jobs are processed.
LPOP	    Remove from left	    redis.lpop()    if you want to process the next job in the queue, use LPOP. This removes and returns the first item from the list.
RPOP	    Remove from right	    redis.rpop()    '''' last job in the queue, use RPOP. This removes and returns the last item from the list.
LLEN	    Count list items	    redis.llen()    if you want to check how many jobs are in the queue, use LLEN.
LRANGE	    Get list elements	    redis.lrange()  '' to retrieve a range of jobs from the queue, use LRANGE.
LINDEX	    Get item by index	    redis.lindex()  '' to access a specific job by its position in the queue, use LINDEX.
LREM	    Remove matching items	redis.lrem()    '' to remove specific jobs from the queue based on a matching value, use LREM.
LTRIM	    Keep a selected range	redis.ltrim()   '' keep only a specific range of jobs in the queue and discard the rest, use LTRIM. This is useful for maintaining a fixed-size queue or removing old jobs.
BLPOP	    Blocking pop from left	redis.blpop()   '' wait for a job to become available in the queue and process it as soon as it does, use BLPOP. This is useful for worker processes that need to handle jobs as they arrive without constantly polling the queue.
BRPOP	    Blocking pop from right	redis.brpop()   '' wait for a job to become available in the queue and process it as soon as it does, use BRPOP. This is useful for worker processes that need to handle jobs as they arrive without constantly polling the queue.
LMOVE	    Move item between lists	redis.lmove()   '' move a job from one queue to another, use LMOVE. This is useful for implementing job prioritization or moving jobs between different processing stages.
 */