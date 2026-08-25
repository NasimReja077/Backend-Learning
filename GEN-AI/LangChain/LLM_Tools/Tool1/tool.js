import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import { HumanMessage } from "@langchain/core/messages";

// ====================== TOOL 1: Calculator ======================
const calculatorTool = tool(
  async ({ a, b, operation }) => {
    console.log(`\n[Tool Running] Calculator → ${a} ${operation} ${b}`);

    switch (operation) {
      case "add": return a + b;
      case "subtract": return a - b;
      case "multiply": return a * b;
      case "divide": return b !== 0 ? a / b : "Cannot divide by zero";
      default: return "Invalid operation";
    }
  },
  {
    name: "calculator",
    description: "Useful for mathematical calculations like add, subtract, multiply, divide",
    schema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
    }),
  }
);

// ====================== TOOL 2: Read File ======================
const readFileTool = tool(
  async ({ filePath }) => {
    console.log(`\n[Tool Running] Reading file → ${filePath}`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  {
    name: "read_file",
    description: "Reads the content of a text file from the local system",
    schema: z.object({
      filePath: z.string().describe("Path of the file (example: ../../../Prompt-Eng/Prompt Engineering.md)"),
    }),
  }
);

// ====================== TOOL 3: Current Time ======================
const currentTimeTool = tool(
  async () => {
    console.log(`\n[Tool Running] Getting current time`);
    return new Date().toLocaleString();
  },
  {
    name: "get_current_time",
    description: "Returns the current date and time",
    schema: z.object({}), // No input needed
  }
);

// ====================== Bind All Tools ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
  apiKey: process.env.MISTRAL_API_KEY,
});

const modelWithTools = model.bindTools([
  calculatorTool,
  readFileTool,
  currentTimeTool,
]);

// ====================== Test ======================
async function main() {
  const questions = [
    "What is 45 multiplied by 8?",
    "What is the current time?",
    "Read the content of ../../../Prompt-Eng/Prompt Engineering.md",
  ];

  for (const question of questions) {
    console.log(`\n\n==============================`);
    console.log(`User: ${question}`);
    console.log(`==============================`);

    const response = await modelWithTools.invoke([
      new HumanMessage(question),
    ]);

    // Check if model wants to call a tool
    if (response.tool_calls?.length > 0) {
      for (const toolCall of response.tool_calls) {
        console.log(`\nModel decided to use tool: ${toolCall.name}`);
        console.log("Arguments:", toolCall.args);

        let result;

        if (toolCall.name === "calculator") {
          result = await calculatorTool.invoke(toolCall.args);
        } else if (toolCall.name === "read_file") {
          result = await readFileTool.invoke(toolCall.args);
        } else if (toolCall.name === "get_current_time") {
          result = await currentTimeTool.invoke(toolCall.args);
        }

        console.log("Tool Result:", result);
      }
    } else {
      console.log("\nAI Reply:", response.content);
    }
  }
}

main();