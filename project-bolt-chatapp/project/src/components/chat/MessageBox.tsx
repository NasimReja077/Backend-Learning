import React from 'react';
import MessageHeader from './MessageHeader';
import MessageInput from './MessageInput';
import MessageArea from './MessageArea';

function MessageBox() {
  return (
    <div className='flex-1 bg-[#0a0d17] text-[#e8f7fa] flex flex-col shadow-lg overflow-hidden'>
      <MessageHeader />
      <div className='flex-1 p-4 overflow-y-auto custom-scrollbar'>
        <MessageArea />
      </div>
      <MessageInput />
    </div>
  );
}

export default MessageBox;