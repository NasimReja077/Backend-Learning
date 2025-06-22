import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/zustand/authStore';
import { toast } from 'react-toastify';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireProfile = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (requireProfile && (!user?.isProfileComplete)) {
      toast.info('Please complete your profile first');
      navigate('/profile');
      return;
    }
  }, [isAuthenticated, user, navigate, requireAuth, requireProfile]);

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireProfile && !user?.isProfileComplete) {
    return null;
  }

  return <>{children}</>;
};