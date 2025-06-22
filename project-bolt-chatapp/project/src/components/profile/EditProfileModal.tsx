import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { useProfileStore } from '../../store/zustand/profileStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileFormData {
  fullName: string;
  email: string;
  bio: string;
  location: string;
  occupation: string;
  avatar?: FileList;
}

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { profile, updateProfile, fetchProfile } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar || '');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditProfileFormData>({
    defaultValues: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      occupation: profile?.occupation || '',
    }
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        email: profile.email,
        bio: profile.bio,
        location: profile.location,
        occupation: profile.occupation,
      });
      setPreviewUrl(profile.avatar);
    }
  }, [profile, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
      await fetchProfile(); // Refresh profile data
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1E293B] rounded-xl p-6 w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <img
                  src={previewUrl || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-500 group-hover:ring-purple-500 transition-all duration-300"
                />
                <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors cursor-pointer group-hover:scale-110">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'fullName', label: 'Full Name', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'bio', label: 'Bio', type: 'textarea' },
                { name: 'location', label: 'Location', type: 'text' },
                { name: 'occupation', label: 'Occupation', type: 'text' },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <label className="text-sm text-gray-400 mb-1 block">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      {...register(field.name as keyof EditProfileFormData)}
                      className="w-full bg-[#2C3A4B] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 min-h-[100px] resize-none"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      {...register(field.name as keyof EditProfileFormData)}
                      type={field.type}
                      className="w-full bg-[#2C3A4B] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  )}
                  {errors[field.name as keyof EditProfileFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[field.name as keyof EditProfileFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-3 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};