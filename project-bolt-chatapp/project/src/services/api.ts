import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.');
    } else if (!error.response) {
      toast.error('Network error. Please check if the backend server is running.');
      console.error('Network Error Details:', error);
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Health check function
const checkBackendHealth = async () => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const authAPI = {
  register: async (data: { email: string; password: string; fullName: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  }
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  }
};

export const chatAPI = {
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  
  createChat: async (userId: string) => {
    const response = await api.post('/chats', { userId });
    return response.data;
  },
  
  getMessages: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },
  
  sendMessage: async (chatId: string, content: string) => {
    const response = await api.post('/messages', { chatId, content });
    return response.data;
  },
  
  markAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  }
};

export { checkBackendHealth };
export default api;