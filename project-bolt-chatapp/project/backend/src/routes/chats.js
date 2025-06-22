import express from 'express';
import { auth } from '../middleware/auth.js';
import { getChats, createChat, getChatMessages } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', auth, getChats);
router.post('/', auth, createChat);
router.get('/:chatId/messages', auth, getChatMessages);

export default router;