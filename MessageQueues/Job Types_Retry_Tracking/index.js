// =====================================
// 🚀 Small Project: Job Types + Retry + Status Tracking
// =====================================

// 📁 Structure
// project/
// ├── config/redis.js
// ├── queue/queue.js
// ├── worker/worker.js
// ├── server.js
// └── .env


// =====================================
// 📁 config/redis.js
// =====================================
import "dotenv/config";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");


// =====================================
// 📁 queue/queue.js
// =====================================
import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

export const queue = new Queue("job-demo", { connection });


// =====================================
// 📁 worker/worker.js
// =====================================
import { Worker } from "bullmq";
import { connection } from "../config/redis.js";

const worker = new Worker(
  "job-demo",
  async (job) => {
    console.log("⚙️ Processing:", job.name);

    switch (job.name) {
      case "email":
        await new Promise((res) => setTimeout(res, 1000));
        return `Email sent to ${job.data.email}`;

      case "math":
        return job.data.a + job.data.b;

      case "fail":
        throw new Error("Intentional failure");

      default:
        throw new Error("Unknown job type");
    }
  },
  { connection }
);

worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} done:`, result);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job.id} failed:`, err.message);
});


// =====================================
// 📁 server.js
// =====================================
import express from "express";
import { queue } from "./queue/queue.js";

const app = express();
app.use(express.json());

// ➤ Add Email Job
app.get("/email", async (req, res) => {
  const job = await queue.add("email", { email: "user@gmail.com" });
  res.json({ jobId: job.id });
});

// ➤ Add Math Job
app.get("/math", async (req, res) => {
  const job = await queue.add("math", { a: 5, b: 10 });
  res.json({ jobId: job.id });
});

// ➤ Add Fail Job (with retry)
app.get("/fail", async (req, res) => {
  const job = await queue.add(
    "fail",
    {},
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    }
  );
  res.json({ jobId: job.id });
});

// ➤ Check Job Status
app.get("/job/:id", async (req, res) => {
  const job = await queue.getJob(req.params.id);

  if (!job) return res.json({ error: "Job not found" });

  const state = await job.getState();

  res.json({
    id: job.id,
    name: job.name,
    state,
    result: job.returnvalue,
    failedReason: job.failedReason,
  });
});

app.listen(3000, () => console.log("🚀 Server running on 3000"));


// =====================================
// 📁 .env
// =====================================
// REDIS_URL=redis://127.0.0.1:6379


// =====================================
// ▶️ Run
// =====================================
// node worker/worker.js
// node server.js


// =====================================
// 🧪 Test APIs
// =====================================
// http://localhost:3000/email
// http://localhost:3000/math
// http://localhost:3000/fail

// Check status:
// http://localhost:3000/job/{jobId}


// =====================================
// 🎯 What You Learn
// =====================================
// ✅ Job Types (email, math, fail)
// ✅ Retry & Backoff (fail job)
// ✅ Status Tracking (/job/:id)
// ✅ Completed & Failed handling

// =====================================
// 🌐 React UI (Status + Result)
// =====================================
// 📁 client/src/App.jsx

import { useState } from "react";
import axios from "axios";

export default function App() {
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const createJob = async (type) => {
    const res = await axios.get(`http://localhost:3000/${type}`);
    setJobId(res.data.jobId);
    setStatus(null);
    setResult(null);
  };

  const checkStatus = async () => {
    if (!jobId) return;
    setLoading(true);
    const res = await axios.get(`http://localhost:3000/job/${jobId}`);
    setStatus(res.data.state);
    setResult(res.data.result || res.data.failedReason);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>⚡ BullMQ Job Demo</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => createJob("email")}>Email Job</button>
        <button onClick={() => createJob("math")}>Math Job</button>
        <button onClick={() => createJob("fail")}>Fail Job</button>
      </div>

      <br />

      {jobId && <p>🆔 Job ID: {jobId}</p>}

      <button onClick={checkStatus}>Check Status</button>

      <br /><br />

      {loading && <p>Loading...</p>}

      {status && (
        <div>
          <p>📊 Status: {status}</p>
          <p>📦 Result: {result}</p>
        </div>
      )}
    </div>
  );
}


// =====================================
// 📁 client/src/main.jsx
// =====================================
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// =====================================
// 📁 client/index.html
// =====================================
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>BullMQ UI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


// =====================================
// ▶️ Run React
// =====================================
// npm create vite@latest client
// cd client
// npm install
// npm install axios
// npm run dev

// Open: http://localhost:5173


// =====================================
// 🔥 Optional Upgrade
// =====================================
// - Auto polling every 2 sec for status
// - Add progress bar
// - Use Socket.IO for real-time updates


// =====================================
// 🚀 NEXT LEVEL UPGRADE (Polling + Progress + Better UX)
// =====================================
// This upgrade adds:
// - Auto polling every 2 sec
// - Progress display
// - Retry attempts info
// - Cleaner UI feedback


// =====================================
// 📁 UPDATE server.js (ADD progress + attempts info)
// =====================================
// Replace /job/:id route with this:

app.get("/job/:id", async (req, res) => {
  const job = await queue.getJob(req.params.id);

  if (!job) return res.json({ error: "Job not found" });

  const state = await job.getState();
  const progress = job.progress || 0;

  res.json({
    id: job.id,
    name: job.name,
    state,
    progress,
    attemptsMade: job.attemptsMade,
    result: job.returnvalue,
    failedReason: job.failedReason,
  });
});


// =====================================
// 📁 UPDATE worker (ADD progress updates)
// =====================================
// inside worker switch cases add:

case "email":
  await job.updateProgress(30);
  await new Promise((res) => setTimeout(res, 1000));
  await job.updateProgress(100);
  return `Email sent to ${job.data.email}`;

case "math":
  await job.updateProgress(100);
  return job.data.a + job.data.b;


// =====================================
// 🌐 React UI (AUTO POLLING + PROGRESS)
// =====================================
// 📁 client/src/App.jsx (REPLACE FILE)

import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [jobId, setJobId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Auto Polling every 2 sec
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await axios.get(`http://localhost:3000/job/${jobId}`);
      setData(res.data);

      // stop polling if completed or failed
      if (res.data.state === "completed" || res.data.state === "failed") {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const createJob = async (type) => {
    setLoading(true);
    const res = await axios.get(`http://localhost:3000/${type}`);
    setJobId(res.data.jobId);
    setData(null);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🚀 BullMQ Advanced UI</h1>

      {/* Job Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => createJob("email")}>Email Job</button>
        <button onClick={() => createJob("math")}>Math Job</button>
        <button onClick={() => createJob("fail")}>Fail Job</button>
      </div>

      <br />

      {/* Job ID */}
      {jobId && <p>🆔 Job ID: {jobId}</p>}

      {/* Loading */}
      {loading && <p>Submitting job...</p>}

      {/* Job Data */}
      {data && (
        <div style={{ border: "1px solid #ccc", padding: 20, marginTop: 20 }}>
          <p>📊 Status: {data.state}</p>

          {/* Progress Bar */}
          <div style={{ background: "#eee", height: 20, width: 300 }}>
            <div
              style={{
                background: "green",
                height: "100%",
                width: `${data.progress || 0}%`,
              }}
            />
          </div>
          <p>Progress: {data.progress || 0}%</p>

          {/* Attempts */}
          <p>🔁 Attempts: {data.attemptsMade}</p>

          {/* Result */}
          <p>
            📦 Result: {data.result || data.failedReason || "Processing..."}
          </p>
        </div>
      )}
    </div>
  );
}



