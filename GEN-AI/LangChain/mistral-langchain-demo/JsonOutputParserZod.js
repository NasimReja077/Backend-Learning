import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });

// 1. Define the structure
const reviewSchema = z.object({
  sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
  containsBadWords: z.boolean(),
  summary: z.string().describe("Short summary of the review"),
  recommendation: z.enum(["Approve", "Flag", "Reject"]),
});

// 2. Bind the schema to the model
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
}).withStructuredOutput(reviewSchema);

// 3. Invoke
const result = await model.invoke(
  "Analyze this review: This is the worst product I have ever bought. Stupid quality!"
);

console.log(result);