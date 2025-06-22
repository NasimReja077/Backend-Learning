import React, { useState } from 'react';
import { Phone, Video, MoreHorizontal, Mail, MapPin, Briefcase, XCircle } from 'lucide-react';
import ImageModal from '../common/ImageModal';

function MessageHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const user = {
    name: "Sarah Wilson",
    status: "Online",
    email: "sarah@example.com",
    location: "New York, USA",
    job: "Software Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    about: "Code. Create. Conquer."
  };

  return (
    <>
      <div 
        className="p-4 border-b border-[#1a1e2e] flex items-center justify-between bg-gradient-to-r from-[#0f172a] to-[#1a1e2e] shadow-md dark:from-gray-900 dark:to-gray-800 cursor-pointer hover:bg-[#1a1e2e] dark:hover:bg-gray-800 transition-colors"
        onClick={() => setShowProfile(true)}
      >
        <div className="flex items-center gap-3">
          <img
            src={user.image}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer ring-2 ring-blue-500 hover:ring-purple-500"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(true);
            }}
          />
          <div>
            <h3 className="font-semibold text-white dark:text-gray-100">{user.name}</h3>
            <span className="text-sm text-green-500">{user.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-[#62456c] dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button 
            className="p-2 hover:bg-[#62456c] dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="w-5 h-5 text-white" />
          </button>
          <button 
            className="p-2 hover:bg-[#62456c] dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-96 bg-[#1E293B]/95 dark:bg-gray-900/95 p-8 rounded-2xl shadow-2xl animate-fadeIn border border-[#374151] dark:border-gray-700 relative">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
              <div className="relative group mb-6">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover transition-all duration-300 group-hover:scale-105 group-hover:border-purple-500 cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-4 border-[#1E293B] dark:border-gray-900"></div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
              <p className="text-gray-400 text-sm mb-6 italic">{user.about}</p>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0f172a]/50 dark:bg-gray-800/50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#0f172a]/50 dark:bg-gray-800/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white">{user.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#0f172a]/50 dark:bg-gray-800/50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Occupation</p>
                    <p className="text-white">{user.job}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <ImageModal
          imageUrl={user.image}
          alt={user.name}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}

export default MessageHeader;