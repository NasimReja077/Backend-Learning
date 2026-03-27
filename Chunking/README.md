# RAG Chunking Strategies

Practical implementations of different **text chunking strategies** for Retrieval-Augmented Generation (RAG) applications, inspired by Greg Kamradt's "5 Levels of Text Splitting".

## 🎯 Goal
Not to chunk for chunking's sake — but to prepare data so it can be **retrieved for value** later.

## 📋 Implemented Strategies

### Level 1: Fixed Size Chunking
- Simple character-based splitting
- With and without overlap

### Level 2: Recursive Chunking
- Using LangChain's `RecursiveCharacterTextSplitter`

### Other Practical Techniques
- Paragraph-based chunking
- Sentence-based chunking
- Structure-aware (Markdown headings)
- Token-based chunking (using tiktoken)
- Basic Semantic Chunking (with cosine similarity)

## 🚀 How to Run

```bash
pip install -r requirements.txt
cd src
python fixed_chunk.py
python recursive_chunk.py
# ... etc