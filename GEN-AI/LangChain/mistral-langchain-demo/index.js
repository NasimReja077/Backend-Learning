import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 1. Initialize Mistral model
const model = new ChatMistralAI({
  model: "mistral-small-latest",   // or "mistral-large-latest"
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

// 2. Create a Prompt Template (System + User)
const prompt = ChatPromptTemplate.fromMessages([
     [
    "system",
    "You are a friendly and helpful AI assistant. Keep answers short and clear.",
  ],
  ["human", "{question}"],
])

// 3. Create a simple chain (Prompt → Model)
const chain = prompt.pipe(model);

// 4. Run the chain
async function main(){
     const question = "What is LangChain in simple words?";
     console.log("Question:", question);
     console.log("Thinking...\n");

     const response = await chain.invoke({
          question: question,
     });

     console.log("Mistral Answer:");
     console.log(response.content);
}

main().catch(console.error);