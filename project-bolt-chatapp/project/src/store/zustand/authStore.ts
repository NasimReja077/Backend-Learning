import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isProfileComplete: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          Cookies.set('token', token, { expires: 7 });
        } else {
          Cookies.remove('token');
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
        Cookies.remove('token');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);