import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from '@pinecone-database/pinecone';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { ChatMistralAI } from "@langchain/mistralai";

// 🔹 Pinecone setup
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-pdf-index");

// 🔹 Embedding model
const embeddings = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed"
});

// 🔹 LLM (chat model)
const llm = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-small"
});

// 🔹 User question
const query = "What does Aarav eventually define 'Skill' as, and how does this relate to his realization about context?";

// 🔹 Step 1: query → embedding
const queryVector = await embeddings.embedQuery(query);

// 🔹 Step 2: Pinecone search
const searchResult = await index.query({
  vector: queryVector,
  topK: 3, // top 3 relevant chunks
  includeMetadata: true
});

// 🔹 Step 3: Extract context
const context = searchResult.matches
  .map(match => match.metadata.text)
  .join("\n\n");

// 🔹 Step 4: Prompt create
const prompt = `
You are a helpful AI assistant.

Answer the question based ONLY on the context below.

Context:
${context}

Question:
${query}
`;

// 🔹 Step 5: LLM call
const response = await llm.invoke(prompt);

// 🔹 Final answer
console.log(response.content);