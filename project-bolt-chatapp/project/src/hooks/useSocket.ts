import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/zustand/authStore';

const SOCKET_URL = 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: user.token
        }
      });

      socketRef.current.emit('login', user.id);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  const sendMessage = (recipientId: string, message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('message', {
        recipientId,
        content: message
      });
    }
  };

  const onMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message', callback);
    }
  };

  const emitTyping = (recipientId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { recipientId });
    }
  };

  const onTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('typing', callback);
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    onMessage,
    emitTyping,
    onTyping
  };
};