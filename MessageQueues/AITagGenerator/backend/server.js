import express from "express";
import { aiQueue } from "./queue/aiQueue.js";
import "./worker/myWorker.js";
import "./events/events.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors());

app.post("/generate-tags", async (req, res) => {
  console.log("📥 Incoming body:", req.body); // 👈 DEBUG
  const { url } = req.body;
  if (!url){
    return res.status(400).json({ error: "URL is required" });
  }

  const job = await aiQueue.add("generate-tags", { url }, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2 sec
    },
  });

  res.json({ jobId: job.id});
});

app.get("/job/:id", async (req, res) => {
  const job = await aiQueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();

  res.json({
    id: job.id,
    state,
    progress: job.progress,
    result: job.returnvalue || null,
  });
});


// app.listen(3000, () => console.log("Server running on 3000"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});