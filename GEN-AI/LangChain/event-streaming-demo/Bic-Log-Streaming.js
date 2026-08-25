import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  ["human", "{question}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

async function runLogStreaming() {
  const logStream = await chain.streamLog({
    question: "What is LangChain?",
  });

  for await (const chunk of logStream) {
    console.log(chunk);
    console.log("-------------------");
  }
}

runLogStreaming();


// Field,                Meaning
// id,                   Unique ID of the step
// streamed_output,      Tokens that were streamed so far
// logs,                 Detailed information of each step
// final_output,         Final result (when available)
// name,                 "Name of the component (model, parser, etc.)"