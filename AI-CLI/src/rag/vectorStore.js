import { MistralAIEmbeddings } from "@langchain/community/embeddings/mistral";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import fs from "fs/promises";
import path from "path";

const VECTOR_STORE_PATH = "./vector-store";

export let vectorStore = null;

export async function initializeVectorStore() {
  const embeddings = new MistralAIEmbeddings({
    model: "mistral-embed",
    apiKey: process.env.MISTRAL_API_KEY,
  });

  try {
    // Load existing store
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
    console.log(chalk.green("✅ Loaded existing vector store"));
  } catch {
    // Create new store
    vectorStore = new HNSWLib(embeddings, { space: "cosine" });
    console.log(chalk.yellow("🆕 Created new vector store"));
  }
}

export async function addDocuments(docs) {
  if (!vectorStore) await initializeVectorStore();
  await vectorStore.addDocuments(docs);
  await vectorStore.save(VECTOR_STORE_PATH);
  console.log(chalk.green(`✅ Indexed ${docs.length} document chunks`));
}

export async function retrieveRelevantDocs(query, k = 4) {
  if (!vectorStore) await initializeVectorStore();
  return await vectorStore.similaritySearch(query, k);
}