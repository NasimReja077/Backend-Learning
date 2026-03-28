/**
 * CONTEXT COMPRESSOR MODULE
 * 
 * This is a simple **extractive compressor**.
 * It filters sentences that contain keywords from the user query.
 * 
 * Note: This is a basic version for learning. 
 * In production, we usually use LLM-based compression for better results.
 */

export const compressContext = (retrievedDocs, query) => {
  
  console.log(`✂️  Compressing context for query: "${query}"`);

  // Convert query into lowercase keywords for matching
  const keywords = query.toLowerCase().trim().split(/\s+/);   // Better word splitting

  const compressedDocs = retrievedDocs.map(doc => {
    
    // Step 1: Split document content into sentences
    const sentences = doc.content.split(/[.?!]/).filter(s => s.trim().length > 0);

    // Step 2: Keep only sentences that contain at least one keyword from the query
    const filteredSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(word => 
        word.length > 2 && lowerSentence.includes(word)
      );
    });

    // Step 3: Join filtered sentences back into a single string
    const compressedText = filteredSentences.join(". ").trim() + (filteredSentences.length ? "." : "");

    return {
      id: doc.id,
      original: doc.content,
      compressed: compressedText || doc.content,   // Fallback: return original if nothing matched
      compressionRatio: doc.content.length > 0 
        ? Math.round((1 - compressedText.length / doc.content.length) * 100) 
        : 0
    };
  });

  console.log(`✅ Context compression completed for ${compressedDocs.length} documents`);
  return compressedDocs;
};