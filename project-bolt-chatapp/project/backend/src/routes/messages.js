import express from 'express';
import { auth } from '../middleware/auth.js';
import { sendMessage, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', auth, sendMessage);
router.put('/:messageId/read', auth, markAsRead);

export default router;