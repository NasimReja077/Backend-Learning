import express from 'express';
import {
  updateAvatar,
  removeAvatar,
  updateCover,
  removeCover,
} from '../controllers/userController.js';
import { createBlog, deleteBlog } from '../controllers/blogController.js';
import {
  uploadAvatar,
  uploadCover,
  uploadBlogThumbnail,
  uploadBlogContentImages,
} from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js'; // Import mock middleware

const router = express.Router();

// Apply authMiddleware to routes that need req.user
router.post('/profile/avatar', authMiddleware, uploadAvatar, updateAvatar);
router.delete('/profile/avatar', authMiddleware, removeAvatar);
router.post('/profile/cover', authMiddleware, uploadCover, updateCover);
router.delete('/profile/cover', authMiddleware, removeCover);
router.post('/blog', authMiddleware, uploadBlogThumbnail, uploadBlogContentImages, createBlog);
router.delete('/blog/:id', authMiddleware, deleteBlog);

// Render views (example routes)
router.get('/profile', authMiddleware, (req, res) => {
  res.render('profile', { user: req.user });
});

router.get('/blog/new', authMiddleware, (req, res) => {
  res.render('blogForm');
});

router.get('/blogs', async (req, res) => {
  res.render('blogs'); // Create blogs.ejs if needed
});

export default router;