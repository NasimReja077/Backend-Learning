// documents.js
// This is our tiny "knowledge base" — the documents RAG will retrieve from.
// In a real system these would come from files, a database, or scraped pages.
// Keep them short and on clearly different topics so retrieval results are
// easy to reason about.

export const documents = [
  {
    id: 1,
    title: "What is RAG",
    text: "Retrieval-Augmented Generation, or RAG, is a technique that combines a search step with a language model generation step. Instead of relying only on what a model learned during training, RAG first retrieves relevant text from an external knowledge base, then feeds that text to the model as extra context before it generates an answer. This helps reduce hallucination and lets the model answer questions about information it was never trained on."
  },
  {
    id: 2,
    title: "Data Structures Basics",
    text: "A data structure is a way of organizing and storing data so it can be accessed and modified efficiently. Common examples include arrays, linked lists, stacks, queues, trees, and graphs. Choosing the right data structure depends on the operations you need to perform often, such as searching, inserting, or deleting elements."
  },
  {
    id: 3,
    title: "Stacks and Queues",
    text: "A stack is a linear data structure that follows Last In First Out order, meaning the most recently added element is the first one removed. A queue follows First In First Out order, where the first element added is the first one removed. Stacks are used in function call management and undo operations, while queues are used in task scheduling and buffering."
  },
  {
    id: 4,
    title: "Binary Search Trees",
    text: "A binary search tree is a tree data structure where each node has at most two children, and for every node, values in the left subtree are smaller and values in the right subtree are larger. This property allows searching, insertion, and deletion in O(log n) time on average, though a poorly balanced tree can degrade to O(n)."
  },
  {
    id: 5,
    title: "Vector Embeddings",
    text: "A vector embedding is a numerical representation of text, where similar pieces of text end up as vectors that are close together in a high dimensional space. Embeddings let a computer measure how similar two pieces of text are by comparing their vectors, usually with a method called cosine similarity. This is the core idea behind semantic search."
  },
  {
    id: 6,
    title: "Cosine Similarity",
    text: "Cosine similarity measures the angle between two vectors rather than their raw distance. Two vectors pointing in almost the same direction have a cosine similarity close to one, even if their lengths differ. It is a popular choice for comparing text vectors because it ignores document length and focuses on direction, which corresponds to topic similarity."
  },
  {
    id: 7,
    title: "Why RAG Reduces Hallucination",
    text: "Language models sometimes generate confident sounding answers that are factually wrong, a problem known as hallucination. RAG reduces this by grounding the model's response in retrieved documents. If the retrieved context actually contains the answer, the model can quote or paraphrase it instead of guessing from memory, which tends to make the output more accurate and verifiable."
  },
  {
    id: 8,
    title: "Chunking Documents",
    text: "Before documents can be embedded and searched, they are usually split into smaller pieces called chunks, often a few sentences or a paragraph long. Chunking matters because embedding an entire long document into a single vector loses fine grained detail, while chunks that are too small lose context. Good chunk size is one of the most important tuning decisions in a RAG system."
  }
];
