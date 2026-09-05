
import { askMistral } from "../utils/mistral.js";
import Task from "../models/Task.js";

export async function WriterAgent(taskId) {
  const task = await Task.findById(taskId);
  if (!task) return;

  task.logs.push({ message: "Writer Agent started writing final answer..." });
  await task.save();

  const systemPrompt = `You are a Writer Agent.
Create a clear, well-structured, and helpful final answer based on the research provided.
Write in a friendly and professional tone.`;

  const finalAnswer = await askMistral(
    systemPrompt,
    `Task: ${task.title}
Description: ${task.description}

Research Notes:
${task.research || "No research available"}`
  );

  task.finalAnswer = finalAnswer;
  task.status = "completed";
  task.logs.push({ message: "Writer Agent completed the final answer" });
  await task.save();

  return finalAnswer;
}