import express from "express";
import Task from "../models/Task.js";
import { ManagerAgent } from "../agents/ManagerAgent.js";
import { ResearcherAgent } from "../agents/ResearcherAgent.js";
import { WriterAgent } from "../agents/WriterAgent.js";

const router = express.Router();

// Create new task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.create({ title, description });

    // Start multi-agent workflow
    runAgents(task._id);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// Get single task
router.get("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json(task);
});

// Multi-agent workflow
async function runAgents(taskId) {
  try {
    const assigned = await ManagerAgent(taskId);

    if (assigned === "Researcher") {
      await ResearcherAgent(taskId);
    }

    await WriterAgent(taskId);
  } catch (err) {
    console.error("Agent workflow error:", err);
    await Task.findByIdAndUpdate(taskId, { status: "failed" });
  }
}

export default router;