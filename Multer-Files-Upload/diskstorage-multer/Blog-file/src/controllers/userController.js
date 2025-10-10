import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middlewares/upload.js';
import { CLOUDINARY_FOLDERS } from '../utils/cloudinary.js';

export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Assuming user is authenticated
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file, CLOUDINARY_FOLDERS.AVATARS);

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    // Update user in database
    user.avatar = { url, publicId };
    await user.save();

    res.redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
      user.avatar = null;
      await user.save();
    }
    res.redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCover = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { url, publicId } = await uploadToCloudinary(req.file, CLOUDINARY_FOLDERS.COVERS);

    if (user.cover?.publicId) {
      await deleteFromCloudinary(user.cover.publicId);
    }

    user.cover = { url, publicId };
    await user.save();

    res.redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCover = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.cover?.publicId) {
      await deleteFromCloudinary(user.cover.publicId);
      user.cover = null;
      await user.save();
    }
    res.redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};