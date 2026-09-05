import { askMistral } from "../utils/mistral.js";
import Task from "../models/Task.js";

export async function ManagerAgent(taskId) {
  const task = await Task.findById(taskId);
  if (!task) return;

  task.logs.push({ message: "Manager Agent received the task" });
  await task.save();

  const systemPrompt = `You are a Manager Agent in a multi-agent system.
Decide which agent should handle the task first.
Available agents: Researcher, Writer.
Reply ONLY with one word: Researcher or Writer.`;

  const decision = await askMistral(
    systemPrompt,
    `Task Title: ${task.title}\nDescription: ${task.description}`
  );

  const chosen = decision.toLowerCase().includes("writer") ? "Writer" : "Researcher";

  task.assignedTo = chosen;
  task.status = chosen === "Researcher" ? "researching" : "writing";
  task.logs.push({ message: `Manager assigned task to ${chosen} Agent` });
  await task.save();

  return chosen;
}