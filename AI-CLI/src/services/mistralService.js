// src/services/mistralService.js
import { Mistral } from '@mistralai/mistralai';
import { ragService } from '../rag/index.js';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const mistralService = {
  async sendMessage(message, useRAG = false) {
    let systemPrompt = "You are a helpful, accurate, and friendly assistant.";

    if (useRAG) {
      const context = await ragService.getContext(message);
      if (context) {
        systemPrompt = `You are a helpful assistant. Answer the question based only on the provided context. 
If the answer is not in the context, say "I don't have enough information in my knowledge base."

Context:
${context}`;
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages,
      temperature: 0.7,
      maxTokens: 1024,
    });

    return response.choices[0].message.content;
  }
};