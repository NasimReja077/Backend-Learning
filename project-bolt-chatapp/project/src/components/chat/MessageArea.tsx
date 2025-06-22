import React, { useState } from 'react';
import { Download, FileText, MessageSquare } from 'lucide-react';
import ImageModal from '../common/ImageModal';

const messages = [
  {
    id: 1,
    text: "Hey Sarah! How's the new project coming along? 👋",
    time: "10:30 AM",
    sender: "user",
    status: "seen",
    type: "text"
  },
  {
    id: 2,
    text: "Hi! It's going great! We just finished the initial design phase 🎨",
    time: "10:32 AM",
    sender: "other",
    status: "seen",
    type: "text"
  },
  {
    id: 3,
    type: "image",
    content: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    caption: "Here's a preview of the dashboard design",
    time: "10:33 AM",
    sender: "other",
    status: "seen"
  }
];

function MessageArea() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {message.sender === 'other' && (
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                alt="Sarah Wilson"
                className="w-8 h-8 rounded-full object-cover mr-2 self-end hover:scale-110 transition-transform cursor-pointer"
                onClick={() => setSelectedImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80")}
              />
            )}
            <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
              <div
                className={`rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white dark:from-blue-600 dark:to-cyan-500'
                    : 'bg-[#1a1e2e] dark:bg-gray-800 hover:bg-[#252a3e] dark:hover:bg-gray-700 transition-colors'
                }`}
              >
                {message.type === 'image' ? (
                  <div className="relative group">
                    <img 
                      src={message.content} 
                      alt={message.caption} 
                      className="rounded-lg max-w-sm cursor-pointer hover:opacity-95 transition-opacity shadow-lg"
                      onClick={() => setSelectedImage(message.content)}
                    />
                    {message.caption && (
                      <p className="text-sm mt-1 text-gray-300">{message.caption}</p>
                    )}
                    <button className="absolute top-2 right-2 p-2 cursor-pointer bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs text-gray-400">{message.time}</span>
              </div>
            </div>
            {message.sender === 'user' && (
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                alt="You"
                className="w-8 h-8 rounded-full object-cover ml-2 self-end hover:scale-110 transition-transform cursor-pointer"
                onClick={() => setSelectedImage("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80")}
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-white dark:text-gray-100">Start Messaging</h3>
          <p className="text-gray-400">Send private messages to Sarah Wilson</p>
        </div>
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt="Image preview"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default MessageArea;