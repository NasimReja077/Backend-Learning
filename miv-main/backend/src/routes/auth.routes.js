import { Router } from "express";
import {
  register, login, getMe, logout,
  registerValidators, loginValidators,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, registerValidators, validate, register);
router.post("/login",    authRateLimiter, loginValidators,    validate, login);
router.get("/me",        protect, getMe);
router.post("/logout",   protect, logout);

export default router;
