export const indexDocument = async (text) => {
  const chunks = await hybridChunk(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    // Example metadata
    const metadata = {
      date: new Date().toISOString(),
      tags: ["AI", "RAG"],
      source: "user_upload",
    };

    storeVector(embedding, chunk, metadata);
  }
};



export const askQuestion = async (question, filters = {}) => {
  const queryEmbedding = await createEmbedding(question);

  const results = searchSimilar(queryEmbedding, filters);

  const context = results.map(r => r.text).join("\n");

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content: "Answer using provided context only",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return response.choices[0].message.content;
};