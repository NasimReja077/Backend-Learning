// // 1. StringOutputParser (Simplest)
// import { StringOutputParser } from "@langchain/core/output_parsers";

// const parser = new StringOutputParser();
// const chain = prompt.pipe(model).pipe(parser);

// const result = await chain.invoke({ question: "What is AI?" });
// console.log(result); // Just a normal string


// 2. JsonOutputParser (Most Used)
// import dotenv from "dotenv";
// import { dirname, resolve } from "node:path";
// import { fileURLToPath } from "node:url";
// import { JsonOutputParser } from "@langchain/core/output_parsers";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { ChatMistralAI } from "@langchain/mistralai";

// dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });

// const model = new ChatMistralAI({
//   model: "mistral-small-latest",
//   temperature: 0,
// });

// const parser = new JsonOutputParser();

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "You are a helpful assistant. Always reply in valid JSON only."],
//   ["human", "{question}\n\n{format_instructions}"],
// ]);

// const chain = prompt.pipe(model).pipe(parser);

// const result = await chain.invoke({
//   question: "Analyze this review: This product is amazing!",
//   format_instructions: parser.getFormatInstructions(),
// });

// console.log(result);


// import { JsonOutputParser } from "@langchain/core/output_parsers";

// const parser = new JsonOutputParser();

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "Always reply in valid JSON format only."],
//   ["human", `Extract information from this text:
// "{text}"

// {format_instructions}`],
// ]);

// const chain = prompt.pipe(model).pipe(parser);

// const result = await chain.invoke({
//   text: "My name is Rahul. I am 25 years old and I live in Pune.",
//   format_instructions: parser.getFormatInstructions(),
// });

// console.log(result);
// Output: { name: "Rahul", age: 25, city: "Pune" }

// 3. CommaSeparatedListOutputParser (List of Items)
// Useful when you want a list.
// import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

// const parser = new CommaSeparatedListOutputParser();

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "Extract key points as a comma-separated list."],
//   ["human", "{text}\n\n{format_instructions}"],
// ]);

// const chain = prompt.pipe(model).pipe(parser);

// const result = await chain.invoke({
//   text: "I like cricket, football and badminton.",
//   format_instructions: parser.getFormatInstructions(),
// });

// console.log(result);
// Output: ["cricket", "football", "badminton"]



// import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

// const parser = new CommaSeparatedListOutputParser();

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "Return only a comma-separated list."],
//   ["human", "List 5 popular programming languages.\n\n{format_instructions}"],
// ]);

// const chain = prompt.pipe(model).pipe(parser);

// const result = await chain.invoke({
//   format_instructions: parser.getFormatInstructions(),
// });

// console.log(result);
// // Output: ["Python", "JavaScript", "Java", "C++", "Go"]

// 4.Structured Output using Zod


import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";

const productSchema = z.object({
  productName: z.string(),
  price: z.number(),
  inStock: z.boolean(),
  category: z.enum(["Electronics", "Clothing", "Food", "Other"]),
  tags: z.array(z.string()),
});

const modelWithStructure = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
}).withStructuredOutput(productSchema);

const result = await modelWithStructure.invoke(`
Extract product details from this text:
"Apple iPhone 15 is available for 79999 rupees. It is in stock under Electronics category. Tags: smartphone, apple, 5g"
`);

console.log(result);

// {
//   productName: "Apple iPhone 15",
//   price: 79999,
//   inStock: true,
//   category: "Electronics",
//   tags: ["smartphone", "apple", "5g"]
// }




// import { z } from "zod";
// import { ChatMistralAI } from "@langchain/mistralai";
// import dotenv from "dotenv";
// import { dirname, resolve } from "node:path";
// import { fileURLToPath } from "node:url";

// dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });

// // 1. Define the structure
// const reviewSchema = z.object({
//   sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
//   containsBadWords: z.boolean(),
//   summary: z.string().describe("Short summary of the review"),
//   recommendation: z.enum(["Approve", "Flag", "Reject"]),
// });

// // 2. Bind the schema to the model
// const model = new ChatMistralAI({
//   model: "mistral-small-latest",
//   temperature: 0,
// }).withStructuredOutput(reviewSchema);

// // 3. Invoke
// const result = await model.invoke(
//   "Analyze this review: This is the worst product I have ever bought. Stupid quality!"
// );

// console.log(result);

// {
//   sentiment: "Negative",
//   containsBadWords: true,
//   summary: "Customer is very unhappy with the product quality.",
//   recommendation: "Flag"
// }


// Feature,       StringOutputParser,      JsonOutputParser,        Zod Structured Output
// Ease of use    ,Very Easy,                   Easy,                    Medium
// Structure,          None,                    Flexible,                Strict
// Type Safety,        No,                      No,                          Yes
// Recommended for Production,No,Yes,Best
// Error Handling,     Low,                     Medium,                       High


// Review Analyzer Example (Real Use Case)
// import { z } from "zod";

// const reviewSchema = z.object({
//   sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
//   rating: z.number().min(1).max(5),
//   containsBadWords: z.boolean(),
//   summary: z.string(),
//   keywords: z.array(z.string()),
// });

// const modelWithStructure = new ChatMistralAI({
//   model: "mistral-small-latest",
//   temperature: 0,
// }).withStructuredOutput(reviewSchema);

// const result = await modelWithStructure.invoke(`
// Analyze this customer review:
// "This phone is amazing! Battery life is great but the camera is just average. Overall I love it."
// `);

// console.log(result);

// {
//   sentiment: "Positive",
//   rating: 4,
//   containsBadWords: false,
//   summary: "Customer likes the phone overall, especially battery, but camera is average.",
//   keywords: ["battery", "camera", "amazing"]
// }


const personSchema = z.object({
  fullName: z.string(),
  age: z.number(),
  skills: z.array(z.string()),
  isEmployed: z.boolean(),
  experienceYears: z.number(),
});

const modelWithStructure = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
}).withStructuredOutput(personSchema);

const result = await modelWithStructure.invoke(`
Extract information:
"Suresh is a 28 year old developer. He knows JavaScript, React and Node.js. He has 4 years of experience and currently works in a company."
`);

console.log(result);