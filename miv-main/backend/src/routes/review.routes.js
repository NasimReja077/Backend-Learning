import { Router } from "express";
import {
  getMovieReviews, createReview, updateReview,
  deleteReview, likeReview, getUserReviews,
  reviewValidators,
} from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

// Public
router.get("/movie/:movieId", getMovieReviews);

// Protected
router.use(protect);
router.get("/my",                    getUserReviews);
router.post("/movie/:movieId",       reviewValidators, validate, createReview);
router.put("/:id",                   reviewValidators, validate, updateReview);
router.delete("/:id",                deleteReview);
router.post("/:id/like",             likeReview);

export default router;
