import express from "express";
import { myQueue } from "./queue/myQueue.js";

const app = express();

app.get("/add", async (req, res) => {
  const job = await myQueue.add("simple-job", { msg: "Hello" });
  res.json({ jobId: job.id });
});

app.get("/delay", async (req, res) => {
  const job = await myQueue.add("delay-job", { msg: "Delay" }, { delay: 3000 });
  res.json({ jobId: job.id });
});

app.get("/retry", async (req, res) => {
  const job = await myQueue.add("fail-job", { msg: "Retry" }, { attempts: 3 });
  res.json({ jobId: job.id });
});


app.get("/add-bulk", async (req, res) => {
  const jobs = [];
  for (let i = 1; i <= 10; i++) {
    jobs.push({
      name: "bulk-job",
      data: { 
        id: i, 
        message: `Bulk message ${i}`,
        priority: i % 3 === 0 ? "high" : "normal"
      }
    });
  }

  const addedJobs = await myQueue.addBulk(jobs);
  res.json({ 
    message: "10 jobs added in bulk",
    jobIds: addedJobs.map(j => j.id)
  });
});

app.get("/priority", async (req, res) => {
  const { level } = req.query;
  const priority = level === "high" ? 1 : 10;

  const job = await myQueue.add("priority-job", {
    message: `Priority ${level || "normal"} job`,
    level: level || "normal"
  }, { 
    priority 
  });

  res.json({ jobId: job.id, priority });
});

// app.get("/repeat", async (req, res) => {
//   const job = await myQueue.add("repeat-job", {
//     message: "This job repeats every 10 seconds"
//   }, {
//     repeat: {
//       every: 10000,        // every 10 seconds
//       // pattern: '*/10 * * * * *'   // alternative cron
//     }
//   });

//   res.json({ 
//     jobId: job.id, 
//     message: "Repeatable job added (runs every 10s)" 
//   });
// });

app.get("/long-running", async (req, res) => {
  const job = await myQueue.add("long-running", {
    task: "Processing large file",
    duration: 8000
  });

  res.json({ jobId: job.id });
});



// Get Queue Stats
app.get("/stats", async (req, res) => {
  const stats = await myQueue.getJobCounts();
  res.json(stats);
});

// Add Job with Custom Name & Data
app.get("/add-custom", async (req, res) => {
  const { name = "custom-job", msg = "Custom message" } = req.query;
  
  const job = await myQueue.add(name, { 
    msg,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    jobId: job.id,
    name: job.name,
    data: job.data 
  });
});

// app.listen(3000, () => console.log("Server running on 3000"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});