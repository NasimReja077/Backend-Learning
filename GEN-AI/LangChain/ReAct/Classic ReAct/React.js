import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ====================== Fake Tools ======================
const tools = {
  calculator: ({ a, b, operation }) => {
    if (operation === "add") return a + b;
    if (operation === "subtract") return a - b;
    if (operation === "multiply") return a * b;
    if (operation === "divide") return b !== 0 ? a / b : "Error";
    return "Invalid operation";
  },
  get_current_time: () => new Date().toLocaleString(),
};

// ====================== Classic ReAct Prompt ======================
const systemPrompt = `
You are a helpful assistant that uses the ReAct format.

You have access to these tools:
- calculator: Used for math. Input format: a, b, operation (add/subtract/multiply/divide)
- get_current_time: Returns current date and time. No input needed.

Use this exact format:

Thought: your reasoning
Action: tool name
Action Input: tool input
Observation: (this will be filled by the system)

... (this Thought/Action/Observation can repeat)

Thought: I now know the final answer
Final Answer: your final answer

Never break this format.
`;

// ====================== Model ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
  apiKey: process.env.MISTRAL_API_KEY,
});

// ====================== Classic ReAct Loop ======================
async function classicReact(question) {
  let history = `Question: ${question}\n`;
  console.log(`\nUser: ${question}\n`);

  for (let step = 1; step <= 6; step++) {
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(history),
    ]);

    const text = response.content;
    console.log(`\n--- Step ${step} ---`);
    console.log(text);

    // Check for Final Answer
    if (text.includes("Final Answer:")) {
      const finalAnswer = text.split("Final Answer:")[1].trim();
      console.log(`\n✅ Final Answer: ${finalAnswer}`);
      return finalAnswer;
    }

    // Extract Action
    const actionMatch = text.match(/Action:\s*(.*)/i);
    const actionInputMatch = text.match(/Action Input:\s*(.*)/i);

    if (!actionMatch) {
      console.log("No action found. Stopping.");
      break;
    }

    const action = actionMatch[1].trim().toLowerCase();
    const actionInput = actionInputMatch ? actionInputMatch[1].trim() : "";

    // Run the tool
    let observation = "Tool not found";

    if (action === "calculator") {
      const parts = actionInput.split(",").map((p) => p.trim());
      observation = tools.calculator({
        a: Number(parts[0]),
        b: Number(parts[1]),
        operation: parts[2],
      });
    } else if (action === "get_current_time") {
      observation = tools.get_current_time();
    }

    console.log(`Observation: ${observation}`);

    // Add to history
    history += text + `\nObservation: ${observation}\n`;
  }
}

// ====================== Run ======================
classicReact("What is 25 multiplied by 8? Also tell me the current time.");