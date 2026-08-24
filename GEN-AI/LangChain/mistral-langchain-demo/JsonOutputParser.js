import "dotenv/config";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatMistralAI } from "@langchain/mistralai";

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is missing. Add it to a .env file or your environment.");
}

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
  apiKey: process.env.MISTRAL_API_KEY,
});

const parser = new JsonOutputParser();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Always reply in valid JSON only."],
  ["human", "{question}\n\n{format_instructions}"],
]);

const chain = prompt.pipe(model).pipe(parser);

const result = await chain.invoke({
  question: "Analyze this review: This product is amazing!",
  format_instructions: parser.getFormatInstructions(),
});

console.log(result);