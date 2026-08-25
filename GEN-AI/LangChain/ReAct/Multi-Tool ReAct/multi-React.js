import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import fs from "fs/promises";

// ====================== TOOL 1: Calculator ======================
const calculatorTool = tool(
  async ({ a, b, operation }) => {
    console.log(`[Tool] Calculator → ${a} ${operation} ${b}`);
    switch (operation) {
      case "add": return String(a + b);
      case "subtract": return String(a - b);
      case "multiply": return String(a * b);
      case "divide": return b !== 0 ? String(a / b) : "Error: Division by zero";
      default: return "Invalid operation";
    }
  },
  {
    name: "calculator",
    description: "Performs add, subtract, multiply, divide operations",
    schema: z.object({
      a: z.number(),
      b: z.number(),
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
    }),
  }
);

// ====================== TOOL 2: Current Time ======================
const timeTool = tool(
  async () => {
    console.log(`[Tool] Getting current time`);
    return new Date().toLocaleString();
  },
  {
    name: "get_current_time",
    description: "Returns the current date and time",
    schema: z.object({}),
  }
);

// ====================== TOOL 3: Read File ======================
const readFileTool = tool(
  async ({ filePath }) => {
    console.log(`[Tool] Reading file → ${filePath}`);
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      return `Error reading file: ${error.message}`;
    }
  },
  {
    name: "read_file",
    description: "Reads content of a local text file",
    schema: z.object({
      filePath: z.string().describe("Path of the file"),
    }),
  }
);

// ====================== Model ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
  apiKey: process.env.MISTRAL_API_KEY,
});

// ====================== Memory ======================
const memory = new MemorySaver();

// ====================== Advanced ReAct Agent ======================
const agent = createReactAgent({
  llm: model,
  tools: [calculatorTool, timeTool, readFileTool],
  checkpointSaver: memory, // Enables Memory
});

// ====================== Run with Memory ======================
async function chat(threadId, question) {
  console.log(`\nUser: ${question}`);

  const result = await agent.invoke(
    {
      messages: [new HumanMessage(question)],
    },
    {
      configurable: { thread_id: threadId }, // Important for memory
      recursionLimit: 10,
    }
  );

  const finalMessage = result.messages[result.messages.length - 1];
  console.log(`AI: ${finalMessage.content}`);
}

async function main() {
  const threadId = "user-123"; // Same thread = remembers conversation

  await chat(threadId, "What is 25 multiplied by 8?");
  await chat(threadId, "Now divide that result by 4");
  await chat(threadId, "What was my first question?");
  await chat(threadId, "What is the current time?");
  await chat(threadId, "give a short samarey content of ../../../Prompt-Eng/Prompt Engineering.md");
}

main();