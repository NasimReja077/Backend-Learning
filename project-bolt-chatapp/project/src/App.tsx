import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthGuard } from './components/auth/AuthGuard';
import Landing from './pages/Landing';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import Loader from './components/Loader';
import Error from './pages/Error';
import OTPVerification from './pages/Auth/OTPVerification';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import { useThemeStore } from './store/zustand/themeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/loader" element={<Loader />} />
          <Route path="*" element={<Error />} />
          <Route path="/chats" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/otp" element={
            <AuthGuard requireAuth={true} requireProfile={false}>
              <OTPVerification />
            </AuthGuard>
          } />
          {/* <Route path="/profile" element={
            <AuthGuard requireAuth={true} requireProfile={false}>
              <Profile />
            </AuthGuard>
          } /> */}
          {/* <Route path="/chats" element={
            <AuthGuard requireAuth={true} requireProfile={true}>
              <Chat />
            </AuthGuard>
          } /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;