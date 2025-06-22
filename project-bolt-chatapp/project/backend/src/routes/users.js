import express from 'express';
import { auth } from '../middleware/auth.js';
import { getProfile, updateProfile, searchUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/search', auth, searchUsers);

export default router;