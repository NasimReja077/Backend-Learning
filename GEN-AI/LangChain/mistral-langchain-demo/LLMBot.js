import "dotenv/config";
import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// ====================== Readline Setup ======================
const rl = readline.createInterface({
  input: process.stdin,   // Listen to keyboard
  output: process.stdout, // Print to terminal
});

// ====================== Model Setup ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

// ====================== Conversation Memory ======================
const messages = [
  new SystemMessage("You are a helpful and friendly AI assistant. Keep answers clear and concise."),
];

console.log("\x1b[33m--- Chat Started (Type 'exit' to quit) ---\x1b[0m\n");

// ====================== Main Chat Loop ======================
async function startChat() {
  while (true) {
    const userInput = await rl.question("\x1b[32mYou: \x1b[0m");

    // Exit condition
    if (userInput.toLowerCase() === "exit") {
      console.log("\x1b[33mChat ended. Goodbye!\x1b[0m");
      rl.close();
      break;
    }

    // 1. Add user message to history
    messages.push(new HumanMessage(userInput));

    try {
      // 2. Send full conversation history to the model
      const response = await model.invoke(messages);

      // 3. Add AI response to history
      messages.push(response); // or new AIMessage(response.content)

      // 4. Show AI reply
      console.log(`\x1b[34mAI: \x1b[0m${response.content}\n`);
    } catch (error) {
      console.error("\x1b[31mError:\x1b[0m", error.message);
    }
  }
}

startChat();