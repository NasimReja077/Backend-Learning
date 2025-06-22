import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Phone, BookOpen, Settings, LogOut, User, Mail, MapPin, Briefcase, UserCog, XCircle } from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';
import { EditProfileModal } from '../profile/EditProfileModal';
import { useProfileStore } from '../../store/zustand/profileStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/zustand/authStore';
import ImageModal from '../common/ImageModal';

function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { profile, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const menuItems = [
    { icon: <MessageSquare />, label: 'Chats', link: '#', active: true },
    { icon: <BookOpen />, label: 'Stories', link: '#' },
    { icon: <Users />, label: 'Groups', link: '#' },
    { icon: <Phone />, label: 'Calls', link: '#' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-20 flex-col justify-between bg-[#0F172A] dark:bg-gray-900 text-white shadow-lg border-r border-[#1E293B] dark:border-gray-800 p-2">
      <div>
        <div className="flex h-16 w-full items-center justify-center border-b border-[#1E293B] dark:border-gray-800">
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">KC</span>
        </div>

        <ul className="mt-4 space-y-6">
          {menuItems.map((item, index) => (
            <li key={index} className="group relative">
              <a
                href={item.link}
                className="flex flex-col items-center justify-center space-y-1 p-3 text-gray-400 hover:bg-blue-600 dark:hover:bg-blue-700 hover:text-white transition-all duration-300 ease-in-out rounded-xl hover:scale-110"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 flex flex-col items-center space-y-6 relative">
        <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
          <Settings className="w-6 h-6 hover:rotate-90 transition-transform duration-500" />
        </button>

        <button className="relative" onClick={() => setShowProfile(!showProfile)}>
          <img
            src={profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out shadow-lg object-cover cursor-pointer"
            onClick={() => setShowImageModal(true)}
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0F172A] dark:border-gray-900"></span>
        </button>

        {showProfile && (
          <div className="absolute bottom-20 left-20 w-96 bg-[#1E293B]/80 dark:bg-gray-900/90 backdrop-blur-md p-6 shadow-2xl z-20 rounded-2xl animate-fadeIn flex flex-col items-center space-y-6 border border-[#374151] dark:border-gray-700">
            <button 
              onClick={() => setShowProfile(false)} 
              className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-red-400 transition duration-300"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="relative group">
              <img
                src={profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg object-cover transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/50 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
            </div>

            <h3 className="text-2xl font-semibold text-white tracking-wide">{profile?.fullName || "Loading..."}</h3>
            <p className="text-gray-400 text-sm italic">{profile?.bio || "No bio yet"}</p>

            <div className="flex flex-col items-center space-y-2 text-gray-300 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" /> {profile?.email || "email@example.com"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" /> {profile?.location || "Location not set"}
              </p>
              <p className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-yellow-400" /> {profile?.occupation || "Occupation not set"}
              </p>
            </div>

            <div className="w-full h-[1px] bg-gray-600 opacity-50"></div>

            <div className="flex w-full justify-around text-gray-400 text-sm font-medium">
              <button 
                onClick={() => {
                  setShowProfile(false);
                  setShowEditProfile(true);
                }}
                className="flex items-center space-x-2 hover:text-blue-500 transition duration-300 cursor-pointer"
              >
                <UserCog className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      {showImageModal && profile?.avatar && (
        <ImageModal
          imageUrl={profile.avatar}
          alt={profile.fullName || "Profile"}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;