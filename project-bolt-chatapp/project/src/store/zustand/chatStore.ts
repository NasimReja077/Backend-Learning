import { create } from 'zustand';
import { chatAPI } from '../../services/api';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    fullName: string;
    avatar: string;
  };
  createdAt: string;
  readBy: string[];
}

interface Chat {
  id: string;
  participants: {
    id: string;
    fullName: string;
    avatar: string;
    email: string;
  }[];
  lastMessage?: Message;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  setActiveChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  error: null,

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchChats: async () => {
    try {
      set({ loading: true });
      const response = await chatAPI.getChats();
      set({ chats: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch chats', loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    try {
      set({ loading: true });
      const response = await chatAPI.getMessages(chatId);
      set({ messages: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch messages', loading: false });
    }
  },

  sendMessage: async (chatId, content) => {
    try {
      const response = await chatAPI.sendMessage(chatId, content);
      const message = response.data;
      set((state) => ({
        messages: [...state.messages, message],
        chats: state.chats.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: message }
            : chat
        )
      }));
    } catch (error) {
      set({ error: 'Failed to send message' });
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      chats: state.chats.map(chat =>
        chat.id === message.chat
          ? { ...chat, lastMessage: message }
          : chat
      )
    }));
  }
}));