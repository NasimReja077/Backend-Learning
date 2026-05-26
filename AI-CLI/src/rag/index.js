import { loadDocuments } from "./documentLoader.js";
import { addDocuments, retrieveRelevantDocs } from "./vectorStore.js";
import chalk from "chalk";

export const ragService = {
  async indexFolder() {
    console.log(chalk.blue("📂 Indexing documents from ./knowledge folder..."));
    const docs = await loadDocuments();
    await addDocuments(docs);
  },

  async getContext(query) {
    const relevantDocs = await retrieveRelevantDocs(query);
    return relevantDocs.map((doc) => doc.pageContent).join("\n\n");
  }
};