import { Router } from "express";
import {
  getProfile, updateProfile, uploadAvatar,
  getPublicProfile, profileValidators,
} from "../controllers/profile.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadAvatar as multerUpload } from "../middlewares/upload.middleware.js";
import { uploadRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Public
router.get("/user/:userId", getPublicProfile);

// Protected
router.use(protect);
router.get("/",              getProfile);
router.put("/",              profileValidators, validate, updateProfile);
router.post("/avatar",       uploadRateLimiter, multerUpload, uploadAvatar);

export default router;
