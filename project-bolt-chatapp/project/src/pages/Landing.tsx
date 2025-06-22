import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Shield, Zap, Users, MessageSquare, Globe, Heart, Smile, Bot, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../store/zustand/themeStore';
import { useParticles } from '../hooks/useParticles';
import Particles from "@tsparticles/react";
import { Engine } from "@tsparticles/engine";

export default function Landing() {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const controls = useAnimation();
  const { initParticles } = useParticles();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ opacity: 1, y: 0 });
    };
    sequence();
  }, [controls]);

  const particlesInit = async (engine: Engine) => {
    await initParticles(engine);
  };

  const features = [
    { icon: <Shield />, title: 'End-to-End Encryption', desc: 'Keep your chats private.' },
    { icon: <Zap />, title: 'Lightning Fast', desc: 'Real-time speed without lag.' },
    { icon: <Users />, title: 'Group Chats', desc: 'Connect with your entire team.' },
    { icon: <MessageSquare />, title: 'Smart Suggestions', desc: 'AI-enhanced chat responses.' },
    { icon: <Globe />, title: 'Global Connectivity', desc: 'Worldwide, no boundaries.' },
    { icon: <Heart />, title: 'Ad-Free Forever', desc: 'Clean and distraction-free.' },
    { icon: <Smile />, title: 'Custom Emojis', desc: 'Express uniquely!' },
    { icon: <Bot />, title: 'AI Chatbot', desc: 'Instant smart assistance.' },
    { icon: <RefreshCw />, title: 'Seamless Sync', desc: 'Messages everywhere.' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#CEE6F2]'} overflow-hidden`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
      />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-4">
            Welcome to KozyChat
          </h1>
          <p className={`text-xl md:text-2xl mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The Future of Fast, Secure, and Smart Messaging
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Connect with Anyone, Anywhere
            </h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Experience the next generation of messaging with KozyChat. Secure, fast, and intelligent communication at your fingertips.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60"
              alt="Chat Interface"
              className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-xl hover:shadow-2xl transition-all`}
            >
              <div className="text-purple-500 mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}