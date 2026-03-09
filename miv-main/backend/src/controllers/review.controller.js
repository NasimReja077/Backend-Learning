import { body } from "express-validator";
import Review from "../models/review.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

// ─── Validators ───────────────────────────────────────────────────────────────
export const reviewValidators = [
  body("rating")
    .isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
  body("content")
    .trim()
    .notEmpty().withMessage("Review content is required")
    .isLength({ max: 1000 }).withMessage("Review cannot exceed 1000 characters"),
  body("spoiler").optional().isBoolean(),
];

// ─── Controllers ──────────────────────────────────────────────────────────────
export const getMovieReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const [reviews, total] = await Promise.all([
    Review.find({ movieId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ movieId }),
  ]);

  const avgRating =
    total > 0
      ? (await Review.aggregate([
          { $match: { movieId: movieId } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]))[0]?.avg || 0
      : 0;

  res.json(
    new ApiResponse(200, {
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      avgRating: Math.round(avgRating * 10) / 10,
    })
  );
});

export const createReview = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { rating, content, spoiler, movieTitle } = req.body;

  const existing = await Review.findOne({ user: req.user._id, movieId });
  if (existing) throw new ApiError(409, "You have already reviewed this movie");

  const review = await Review.create({
    user: req.user._id,
    movieId,
    movieTitle: movieTitle || "",
    rating,
    content,
    spoiler: spoiler || false,
  });

  await review.populate("user", "username avatar");
  res.status(201).json(new ApiResponse(201, { review }, "Review posted successfully"));
});

export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, content, spoiler } = req.body;

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own reviews");
  }

  review.rating = rating ?? review.rating;
  review.content = content ?? review.content;
  review.spoiler = spoiler ?? review.spoiler;
  await review.save();
  await review.populate("user", "username avatar");

  res.json(new ApiResponse(200, { review }, "Review updated"));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  await review.deleteOne();
  res.json(new ApiResponse(200, null, "Review deleted"));
});

export const likeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  const userId = req.user._id.toString();
  const liked = review.likes.map((l) => l.toString()).includes(userId);

  if (liked) {
    review.likes = review.likes.filter((l) => l.toString() !== userId);
  } else {
    review.likes.push(req.user._id);
  }
  await review.save();

  res.json(new ApiResponse(200, { liked: !liked, likesCount: review.likes.length }));
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { reviews }));
});
