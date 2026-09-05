import { askMistral } from "../utils/mistral.js";
import Task from "../models/Task.js";

export async function ResearcherAgent(taskId) {
  const task = await Task.findById(taskId);
  if (!task) return;

  task.logs.push({ message: "Researcher Agent started working..." });
  await task.save();

  const systemPrompt = `You are a Researcher Agent. 
Provide clear, useful research notes and key points about the given topic.
Be concise but informative.`;

  const research = await askMistral(
    systemPrompt,
    `Research this task:\nTitle: ${task.title}\nDescription: ${task.description}`
  );

  task.research = research;
  task.status = "writing";
  task.logs.push({ message: "Researcher Agent finished research" });
  await task.save();

  return research;
}