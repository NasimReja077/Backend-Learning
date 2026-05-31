// src/services/mistralService.js
import { Mistral } from '@mistralai/mistralai';
import chalk from 'chalk';
import { ragService } from '../rag/index.js';
import { settings } from '../config/settings.js';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Conversation history for multi-turn chat
let conversationHistory = [];

export const mistralService = {
  clearHistory() {
    conversationHistory = [];
  },

  getHistory() {
    return [...conversationHistory];
  },

  async sendMessage(message, useRAG = false, stream = false) {
    const model = settings.getModel();
    const temperature = settings.getTemperature();

    let systemPrompt = "You are a helpful, accurate, and friendly assistant. Be concise but thorough.";

    if (useRAG) {
      const context = await ragService.getContext(message);
      if (context) {
        systemPrompt = `You are a helpful assistant. Answer using ONLY the context below. If the answer is not in the context, say "I don't have that information in my knowledge base."\n\nContext:\n${context}`;
      }
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ];

    try {
      if (stream) {
        let fullResponse = '';
        const response = await client.chat.stream({
          model,
          messages,
          temperature,
        });

        for await (const chunk of response) {
          const token = chunk.data.choices[0]?.delta?.content || '';
          process.stdout.write(chalk.white(token));
          fullResponse += token;
        }
        console.log('\n');

        // Add assistant response to history
        conversationHistory.push({ role: 'assistant', content: fullResponse });
        return fullResponse;
      }

      // Non-stream
      const response = await client.chat.complete({
        model,
        messages,
        temperature,
      });

      const reply = response.choices[0].message.content;
      conversationHistory.push({ role: 'assistant', content: reply });
      return reply;

    } catch (err) {
      // Remove the user message if request failed
      conversationHistory.pop();
      throw err;
    }
  }
};