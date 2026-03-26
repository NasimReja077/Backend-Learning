import dotenv from "dotenv";
dotenv.config();

import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // 🔹 Text to small chunks
import { MistralAIEmbeddings } from "@langchain/mistralai";
import fs from 'fs';

import { Pinecone } from '@pinecone-database/pinecone'
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("rag-pdf-index") // Select Existing index

let dataBuffer = fs.readFileSync('./story.pdf');

// Initialize PDF parser 
const parser = new PDFParse({
    data: dataBuffer
})

// PDF to text extract
const data = await parser.getText()

// Embedding model initialize
const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed"
})

// Text splitter
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // max 500 characters in one chunk
    chunkOverlap: 0,
})

// pdf text to create chunks
const chunks = await splitter.splitText(data.text)
// const docs = await embeddings.embedQuery(chunks) // passing  array
// const docs = await embeddings.embedDocuments(chunks);

// object
// every chunks embedding generate karo
const docs = await Promise.all(
    chunks.map(async (chunk) => {
    const embedding = await embeddings.embedQuery(chunk) // text -> vector
    return {
        text: chunk,
        embedding
    }
}))

// console.log(docs); // 1024

// store in VDB
const result = await index.upsert({
    records: docs.map((doc, i) => ({
        id: `doc-${i}`,
        values: doc.embedding,
        metadata: {
            text: doc.text
        }
    }))
})

console.log(result);