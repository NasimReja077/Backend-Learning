function structureChunk(text) {
  const sections = text.split("# ");
  return sections.map(sec => sec.trim());
}

const text = `
# Intro
AI is growing

# Methods
RAG uses chunking

# Level 1 : Fixed Size Chunking
### This is the most crude and simplest method of segmenting the text. 
It breaks down the text into chunks of a specified number of characters, regardless of their content or structure.

# Level 2: Recursive Chunking
While Fixed size chunking is easier to implement, it doesn’t consider the structure of text. Recursive chunking offers an alternative.

# Conclusion
Future is AI
`;

console.log(structureChunk(text));