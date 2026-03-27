import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import cosineSimilarity from "cosine-similarity";


const textConten = `Introduction
Breaking down your large data files into more manageable segments is one of the most crucial steps for enhancing the efficiency of LLM applications. The goal is to provide the LLM with precisely the information needed for the specific task, and nothing more.

“What should be the right chunking strategy in my solution” is one of the initial and fundamental decision a LLM practitioner must make while building advance RAG solution.

In his video, Greg Kamradt provides overview of different chunking strategies. These strategies can be leveraged as starting points to develop RAG based LLM application. They have been classified into five levels based on the complexity and effectiveness.

Your goal is not to chunk for chunking sake, our goal is to get our data in a format where it can be retrieved for value later.

Level 1 : Fixed Size Chunking
This is the most crude and simplest method of segmenting the text. It breaks down the text into chunks of a specified number of characters, regardless of their content or structure.

Langchain and llamaindex framework offer CharacterTextSplitter and SentenceSplitter (default to spliting on sentences) classes for this chunking technique. A few concepts to remember -

How the text is split: by single character
How the chunk size is measured: by number of characters
chunk_size: the number of characters in the chunks
chunk_overlap: the number of characters that are being overlap in sequential chunks. keep duplicate data across chunks
separator: character(s) on which the text would be split on (default “”)

Level 2: Recursive Chunking
While Fixed size chunking is easier to implement, it doesn’t consider the structure of text. Recursive chunking offers an alternative.

In this method, we divide the text into smaller chunk in a hierarchical and iterative manner using a set of separators. If the initial attempt at splitting the text doesn’t produce chunks of the desired size, the method recursively calls itself on the resulting chunks with a different separator until the desired chunk size is achieved.

Write on Medium
Langchain framework offers RecursiveCharacterTextSplitter class, which splits text using default separators (“\n\n”, “\n”, “ “,””)`;


// Step 1: Recursive split
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 80,
});

// Step 2: Fake embedding (replace with OpenAI later)
function fakeEmbedding(text) {
  return text.split("").map(c => c.charCodeAt(0) % 10);
}

// Step 3: Semantic filter
function filterChunks(chunks, threshold = 0.8) {
  const filtered = [];

  for (let i = 0; i < chunks.length; i++) {
    if (i === 0) {
      filtered.push(chunks[i]);
      continue;
    }

    const prev = fakeEmbedding(filtered[filtered.length - 1]);
    const curr = fakeEmbedding(chunks[i]);

    const sim = cosineSimilarity(prev, curr);

    if (sim < threshold) {
      filtered.push(chunks[i]);
    }
  }

  return filtered;
}

// MAIN
const run = async () => {
  const text = textConten;

  const chunks = await splitter.splitText(text);

  const finalChunks = filterChunks(chunks);

  console.log("Final Chunks:", finalChunks);
};

run();