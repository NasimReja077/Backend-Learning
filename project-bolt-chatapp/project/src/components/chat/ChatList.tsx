import React from 'react';
import { Bell } from 'lucide-react';
import Search from './Search';
import UserList from './UserList';

function ChatList() {
  return (
    <div className='w-[30%] bg-[#00020c] text-[#cfd1fe] border-r border-[#1a1e2e] flex flex-col'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent'>Messages</h2>
            <p className='text-sm text-gray-400 mt-1'>10 unread messages</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#990397] rounded-full transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
        <Search />
      </div>
      <UserList />
    </div>
  );
}

export default ChatList;