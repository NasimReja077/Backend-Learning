import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

let conversationHistory = [];

export const mistralService = {
  async sendMessage(message) {
    conversationHistory.push({ role: 'user', content: message });

    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: conversationHistory,
      temperature: 0.7,
    });

    const aiReply = response.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: aiReply });

    return aiReply;
  },

  clearHistory() {
    conversationHistory = [];
  },

  getHistory() {
    return conversationHistory;
  }
};