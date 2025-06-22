import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setActiveChat, addMessage, setMessages } from '../store/slices/chatSlice';

export function useChat() {
  const dispatch = useDispatch();
  const chat = useSelector((state: RootState) => state.chat);

  const selectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  const sendMessage = (message: any) => {
    dispatch(addMessage(message));
  };

  const loadMessages = (messages: any[]) => {
    dispatch(setMessages(messages));
  };

  return {
    ...chat,
    selectChat,
    sendMessage,
    loadMessages,
  };
}