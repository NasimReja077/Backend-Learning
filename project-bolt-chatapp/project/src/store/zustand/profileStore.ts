import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface Profile {
  fullName: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  occupation: string;
}

interface ProfileState {
  profile: Profile | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: Profile) => void;
  setIsEditing: (isEditing: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isEditing: false,
      isLoading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setIsEditing: (isEditing) => set({ isEditing }),
      clearError: () => set({ error: null }),
      updateProfile: async (updates) => {
        try {
          set({ isLoading: true, error: null });
          const updatedProfile = await userAPI.updateProfile(updates);
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updatedProfile } : null,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const profile = await userAPI.getProfile();
          set({ profile, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMessage, isLoading: false });
          console.error('Profile fetch error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);