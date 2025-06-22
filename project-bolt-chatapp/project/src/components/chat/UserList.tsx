import React from 'react';

const chatData = [
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    message: "Hey! How's your project going? 🚀",
    time: "2m ago",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "James Rodriguez",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    message: "The meeting is scheduled for tomorrow at 10 AM",
    time: "45m ago",
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    message: "Thanks for your help yesterday! 🙏",
    time: "2h ago",
    unread: 1,
    online: false
  }
];

function UserList() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#0F172A]">
      {chatData.map((chat) => (
        <div
          key={chat.id}
          className="p-4 hover:bg-[#1e293b] cursor-pointer transition-all duration-300 border-b border-[#1a1e2e] group rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-full h-full rounded-full object-cover group-hover:ring-2 ring-cyan-400 transition-all"
              />
              {chat.online && (
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0d17] animate-pulse"></span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate text-lg text-white group-hover:text-cyan-300 transition-all">
                  {chat.name}
                </h3>
                <span className="text-xs text-gray-400 flex-shrink-0 group-hover:text-gray-300">
                  {chat.time}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-400 truncate pr-4 group-hover:text-gray-200">
                  {chat.message}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-md">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserList;