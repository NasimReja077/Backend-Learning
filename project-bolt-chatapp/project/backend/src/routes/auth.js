import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty()
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.get('/verify/:token', verifyEmail);

export default router;