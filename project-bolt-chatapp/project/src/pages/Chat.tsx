import React from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatList from '../components/chat/ChatList';
import MessageBox from '../components/chat/MessageBox';

function Chat() {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <ChatList />
      <MessageBox />
    </div>
  );
}

export default Chat;