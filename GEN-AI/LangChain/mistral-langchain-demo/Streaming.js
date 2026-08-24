import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Keep answers clear and concise."],
  ["human", "{question}"],
]);

const chain = prompt.pipe(model);

async function streamResponse() {
  const question = "Explain Quantum Computing in simple words.";

  console.log("Question:", question);
  console.log("\nStreaming Answer:\n");

  // Start streaming
  const stream = await chain.stream({
    question: question,
  });

  // Print each chunk as it arrives
  for await (const chunk of stream) {
    // chunk.content is the new piece of text
    process.stdout.write(chunk.content);
  }

  console.log("\n\n--- Streaming Finished ---");
}

streamResponse();