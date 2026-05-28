// src/services/mistralService.js
import { Mistral } from '@mistralai/mistralai';
import { ragService } from '../rag/index.js';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const mistralService = {
  async sendMessage(message, useRAG = false, stream = false) {
    let systemPrompt = "You are a helpful, accurate, and friendly assistant.";

    if (useRAG) {
      const context = await ragService.getContext(message);
      if (context) {
        systemPrompt = `Answer using only the context below. Say you don't know if information is missing.\n\nContext:\n${context}`;
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    if (stream) {
      let fullResponse = '';
      const response = await client.chat.stream({
        model: 'mistral-large-latest',
        messages,
        temperature: 0.7,
      });

      for await (const chunk of response) {
        const token = chunk.data.choices[0]?.delta?.content || '';
        process.stdout.write(chalk.white(token));
        fullResponse += token;
      }
      console.log('\n');
      return fullResponse;
    }

    // Non-stream fallback
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }
};