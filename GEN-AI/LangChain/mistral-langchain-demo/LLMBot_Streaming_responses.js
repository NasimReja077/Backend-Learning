import "dotenv/config";
import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// ====================== Readline Setup ======================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ====================== Model Setup ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

// ====================== Conversation Memory ======================
const messages = [
  new SystemMessage(
    "You are a helpful and friendly AI assistant. Keep answers clear and concise."
  ),
];

console.log("\x1b[33m--- Chat Started (Type 'exit' to quit) ---\x1b[0m\n");

// ====================== Main Chat Loop ======================
async function startChat() {
  while (true) {
    const userInput = await rl.question("\x1b[32mYou: \x1b[0m");

    // Exit condition
    if (userInput.toLowerCase().trim() === "exit") {
      console.log("\x1b[33mChat ended. Goodbye!\x1b[0m");
      rl.close();
      break;
    }

    // 1. Add user message to history
    messages.push(new HumanMessage(userInput));

    try {
      // 2. Start streaming response
      process.stdout.write("\x1b[34mAI: \x1b[0m");

      const stream = await model.stream(messages);

      let fullResponse = "";

      // 3. Print each chunk as it arrives
      for await (const chunk of stream) {
        const content = chunk.content || "";
        process.stdout.write(content);   // Print instantly
        fullResponse += content;         // Collect full answer
      }

      console.log("\n"); // New line after response finishes

      // 4. Save full AI response in history
      messages.push(new AIMessage(fullResponse));

    } catch (error) {
      console.error("\n\x1b[31mError:\x1b[0m", error.message);
    }
  }
}

startChat();