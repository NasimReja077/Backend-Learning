# Retrieval-Augmented Generation (RAG)

## What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique that enhances Large Language Models (LLMs) by combining them with external knowledge retrieval. Instead of relying solely on the knowledge baked into the model during training, RAG allows the model to fetch relevant information from external sources (documents, databases, APIs, etc.) and use that information to generate more accurate, up-to-date, and grounded responses.

In simple terms:  
**RAG = Retrieval + Generation**

The model first **retrieves** relevant context, then **generates** an answer conditioned on that context.

---

## Why Do We Need RAG?

LLMs have several inherent limitations:

| Limitation                    | Description                                                                 | How RAG Helps                                      |
|-------------------------------|-----------------------------------------------------------------------------|----------------------------------------------------|
| Knowledge Cutoff              | Models only know information up to their training date                      | Retrieves current / domain-specific data           |
| Hallucinations                | Models can confidently generate false information                           | Grounds answers in retrieved evidence              |
| Lack of Domain Knowledge      | General models may not know specialized or private data                     | Injects private / proprietary knowledge            |
| Static Knowledge              | Cannot easily update without expensive retraining                           | Knowledge base can be updated independently        |
| Citation / Traceability       | Hard to know where an answer came from                                      | Can cite the retrieved sources                     |

---

## How RAG Works (High-Level Pipeline)

A typical RAG system follows these steps:

```
User Query
    ↓
1. Query Understanding / Rewriting (optional)
    ↓
2. Retrieval
    • Convert query → embedding
    • Search vector database / knowledge base
    • Return top-k relevant chunks
    ↓
3. Context Augmentation
    • Combine retrieved chunks + original query
    ↓
4. Generation
    • LLM generates answer using the augmented prompt
    ↓
Final Response (often with citations)
```

### Detailed Steps

1. **Indexing (Offline / One-time)**
   - Split documents into chunks
   - Generate embeddings for each chunk
   - Store embeddings + original text in a vector database (or hybrid search index)

2. **Retrieval (Online)**
   - Embed the user query
   - Perform similarity search (cosine similarity, dot product, etc.)
   - Optionally re-rank results
   - Select top-k most relevant chunks

3. **Generation**
   - Construct a prompt that includes:
     - System instructions
     - Retrieved context
     - User question
   - LLM generates the final answer

---

## Core Components of a RAG System

| Component              | Role                                                                 | Common Tools / Technologies                          |
|------------------------|----------------------------------------------------------------------|------------------------------------------------------|
| Document Loader        | Ingest data from various sources                                     | LangChain, LlamaIndex, Unstructured, custom loaders |
| Text Splitter          | Break documents into manageable chunks                               | RecursiveCharacterTextSplitter, SemanticChunker     |
| Embedding Model        | Convert text → dense vectors                                         | OpenAI, Cohere, HuggingFace, Voyage, BGE, etc.      |
| Vector Store           | Store and search embeddings efficiently                              | Pinecone, Weaviate, Chroma, Qdrant, FAISS, Milvus   |
| Retriever              | Fetch relevant documents                                             | Similarity search, Hybrid search, Multi-query       |
| Reranker (optional)    | Improve ranking of retrieved results                                 | Cross-encoders, Cohere Rerank, ColBERT              |
| LLM                    | Generate the final response                                          | GPT, Claude, Llama, Gemini, Mistral, etc.           |
| Orchestration          | Glue everything together                                             | LangChain, LlamaIndex, Haystack, custom code        |

---

## Types of RAG

### 1. Naive RAG
- Simple retrieve → generate pipeline
- No query rewriting or advanced ranking

### 2. Advanced RAG
- Query rewriting / expansion
- Hybrid search (dense + sparse)
- Re-ranking
- Contextual compression
- Multi-hop retrieval

### 3. Modular RAG
- Highly customizable pipeline with interchangeable components
- Supports routing, multi-retrievers, agents, etc.

### 4. Agentic RAG
- Uses agents / tool-calling LLMs to decide when and what to retrieve
- Can perform multi-step reasoning and iterative retrieval

---

## Benefits of RAG

- **Reduced Hallucinations** — Answers are grounded in retrieved data
- **Up-to-date Knowledge** — No need to retrain the model
- **Domain Adaptation** — Easy to inject specialized or private knowledge
- **Cost Effective** — Cheaper than fine-tuning large models
- **Transparency** — Can show source documents
- **Scalability** — Knowledge base can grow independently of the model

---

## Challenges & Limitations

| Challenge                  | Description                                                                 | Possible Mitigations                              |
|----------------------------|-----------------------------------------------------------------------------|---------------------------------------------------|
| Retrieval Quality          | Irrelevant or missing documents → poor answers                              | Better chunking, hybrid search, re-ranking        |
| Chunking Strategy          | Too large or too small chunks hurt performance                              | Semantic / hierarchical chunking                  |
| Context Window Limits      | Too many retrieved chunks may exceed LLM context                            | Compression, selective retrieval, summarization   |
| Latency                    | Extra retrieval step increases response time                                | Caching, approximate search, smaller models       |
| Noise in Retrieved Data    | Conflicting or low-quality sources                                          | Source filtering, re-ranking, confidence scoring  |
| Evaluation Difficulty      | Hard to measure end-to-end quality                                          | RAGAS, custom metrics, human evaluation           |

---

## Common Use Cases

- **Enterprise Search / Knowledge Assistants**  
  Internal company documents, wikis, policies

- **Customer Support Chatbots**  
  Product manuals, FAQs, ticket history

- **Legal / Medical / Research Assistants**  
  Case law, medical literature, scientific papers

- **Code Assistants**  
  Documentation + codebase retrieval

- **Personalized Recommendations**  
  User history + product catalogs

---

## Simple Example (Conceptual)

**Without RAG:**
```
User: What is the parental leave policy at Acme Corp?
LLM:  (makes something up based on general knowledge)
```

**With RAG:**
```
1. Retrieve relevant sections from Acme Corp HR policy documents
2. Pass those sections + question to the LLM
3. LLM answers based on the actual policy and can cite the source
```

---

## Evaluation Metrics for RAG

| Category     | Metrics                                      |
|--------------|----------------------------------------------|
| Retrieval    | Precision@k, Recall@k, MRR, nDCG             |
| Generation   | Faithfulness, Answer Relevance, Context Relevance |
| End-to-End   | RAGAS score, Human preference, Task accuracy |

Popular evaluation frameworks: **RAGAS**, **ARES**, **TruLens**, **DeepEval**

---

## Best Practices

1. **Chunking matters a lot** — Experiment with size and overlap
2. **Use hybrid search** (dense + BM25) when possible
3. **Add a re-ranker** for production systems
4. **Include metadata** (source, date, author) for better filtering and citations
5. **Monitor retrieval quality** — Bad retrieval = bad generation
6. **Start simple**, then add complexity (query rewriting, multi-hop, agents)
7. **Cite sources** whenever possible for trust and verifiability

---

## Summary

RAG is currently one of the most practical and widely adopted techniques for building reliable LLM applications. It bridges the gap between the powerful reasoning capabilities of large language models and the need for accurate, current, and domain-specific knowledge — without the cost and complexity of constant model retraining.

> **Key Insight**:  
> The quality of a RAG system is usually limited more by the **retrieval** component than by the LLM itself.

---

*Created for educational purposes.*
