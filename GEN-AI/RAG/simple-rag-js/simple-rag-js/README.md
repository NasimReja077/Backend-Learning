# Simple RAG in JavaScript

A tiny, dependency-free project to understand **Retrieval-Augmented Generation (RAG)**
by building it from scratch. No API keys or npm installs required to run it.

## What is RAG?

Normally, an LLM answers only from what it learned during training. RAG adds
a search step first: it looks up relevant text from your own documents, then
gives that text to the model as context before it answers. This lets the model
answer questions about *your* data, and reduces made-up answers (hallucination).

The pipeline has 4 steps:

```
Query -> [1. Retrieve relevant chunks] -> [2. Augment prompt with them] -> [3. Generate answer]
```

## Project structure

```
simple-rag-js/
├── src/
│   ├── documents.js    # The knowledge base (8 short sample documents)
│   ├── vectorizer.js   # Turns text into vectors (TF-IDF) + cosine similarity
│   ├── retriever.js    # Finds the top-k most relevant documents for a query
│   ├── generator.js    # Builds the augmented prompt + produces an answer
│   └── index.js         # Runs the full pipeline and prints each step
├── package.json
└── README.md
```

## How each file maps to a RAG concept

| File             | RAG concept it teaches                                              |
|------------------|-----------------------------------------------------------------------|
| `documents.js`   | The corpus / knowledge base you retrieve from                       |
| `vectorizer.js`  | Embeddings — turning text into comparable numeric vectors            |
| `retriever.js`   | Retrieval — finding the most relevant chunks via cosine similarity   |
| `generator.js`   | Augmentation (prompt building) + Generation (producing the answer)   |
| `index.js`       | The orchestrator that wires retrieval → augmentation → generation    |

## Running it

```bash
cd simple-rag-js
node src/index.js "What is a stack used for?"
```

Try other questions to see retrieval change:

```bash
node src/index.js "How does RAG reduce hallucination?"
node src/index.js "What is cosine similarity?"
```

Each run prints:
1. Your question
2. The top 3 retrieved chunks with their similarity scores
3. The full augmented prompt that would be sent to an LLM
4. The final generated answer

## Two generation modes

- **Offline (default)** — no setup needed. It picks the sentence from the
  retrieved context that overlaps most with your question. This is a stand-in
  for "generation" so you can see the whole pipeline work with zero setup.
- **Real LLM mode** — set an environment variable and it calls the actual
  Claude API instead:

  ```bash
  export ANTHROPIC_API_KEY=your_key_here
  node src/index.js "How does RAG reduce hallucination?"
  ```

  Now step 3 is genuine LLM generation, grounded in the retrieved context.

## Why TF-IDF instead of a "real" embedding model?

Real RAG systems use neural embedding models (e.g. OpenAI, Voyage, Cohere
embeddings) which capture meaning, not just word overlap. This project uses
TF-IDF instead because:

- It needs no API key and no internet call — runs instantly, offline.
- The core idea is identical: **turn text into a vector, compare vectors with
  cosine similarity.**
- Once this clicks, swapping in a real embedding API is a one-function change
  — replace what happens inside `embedText()` in `vectorizer.js`. Nothing else
  in the pipeline needs to know the difference.

## Ideas to extend this project

- Swap TF-IDF for a real embedding API (OpenAI, Voyage, or Anthropic's
  upcoming embeddings) to see semantic (meaning-based) retrieval vs. keyword-based.
- Add a real vector database (e.g. a simple JSON file, or Pinecone/Chroma) so
  documents persist and scale beyond memory.
- Improve chunking: split long documents into overlapping paragraphs instead
  of using one document as one chunk.
- Add a simple web UI (HTML + fetch) instead of the CLI.
- Track which chunk actually contributed to the final answer, to build a
  "citations" feature.
