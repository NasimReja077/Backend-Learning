/**
 * SIMPLE DUMMY EMBEDDING FUNCTION
 * 
 * This is a very basic, fake embedding generator used for learning and testing.
 * 
 * ⚠️ IMPORTANT: This is NOT a real embedding model.
 * Real embeddings (like Mistral, OpenAI, or Sentence-Transformers) create 
 * meaningful dense vectors that capture the semantic meaning of text.
 * 
 * This function only converts each character into a number — it has almost 
 * no understanding of language or meaning.
 */

export const getEmbedding = (text) => {
  
  // Step 1: Convert the entire text to lowercase
  // This makes the embedding case-insensitive ("Hello" and "hello" become the same)
  const lowerText = text.toLowerCase();

  // Step 2: Split the text into an array of individual characters
  // Example: "hello" → ['h', 'e', 'l', 'l', 'o']
  const characters = lowerText.split("");

  // Step 3: Convert each character into a number and normalize it
  // Process:
  //   1. char.charCodeAt(0)  → gets the Unicode/ASCII value of the character
  //   2. Divide by 255        → normalizes the value to range between 0 and 1
  // 
  // Why divide by 255?
  //   Most common characters have char codes between 0 and 255.
  //   Dividing by 255 scales the values to [0, 1] range, which is common for embeddings.
  const embedding = characters.map((char) => {
    const charCode = char.charCodeAt(0);     // Get numeric code (e.g., 'a' = 97)
    return charCode / 255;                   // Normalize to [0, 1]
  });

  // Return the final embedding vector (an array of numbers)
  return embedding;
};