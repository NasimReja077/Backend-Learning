import { body } from "express-validator";
import User from "../models/user.model.js";
import Favorite from "../models/favorite.model.js";
import History from "../models/history.model.js";
import Review from "../models/review.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.config.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

// ─── Validators ───────────────────────────────────────────────────────────────
export const profileValidators = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Bio cannot exceed 200 characters"),
];

// ─── Controllers ──────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const [favCount, historyCount, reviewCount] = await Promise.all([
    Favorite.countDocuments({ userId: req.user._id }),
    History.countDocuments({ user: req.user._id }),
    Review.countDocuments({ user: req.user._id }),
  ]);

  res.json(
    new ApiResponse(200, {
      user: req.user,
      stats: { favorites: favCount, watched: historyCount, reviews: reviewCount },
    })
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio } = req.body;

  if (username && username !== req.user.username) {
    const exists = await User.findOne({ username });
    if (exists) throw new ApiError(409, "Username already taken");
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { ...(username && { username }), ...(bio !== undefined && { bio }) },
    { new: true, runValidators: true }
  ).select("-password");

  res.json(new ApiResponse(200, { user: updated }, "Profile updated successfully"));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary if exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId).catch(() => {});
  }

  let result;
  try {
    result = await uploadToCloudinary(req.file.path);
  } finally {
    // Clean up temp file
    fs.unlink(req.file.path, () => {});
  }

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save();

  res.json(
    new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully")
  );
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    "username avatar bio createdAt"
  );
  if (!user) throw new ApiError(404, "User not found");

  const [reviewCount, reviews] = await Promise.all([
    Review.countDocuments({ user: user._id }),
    Review.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
  ]);

  res.json(new ApiResponse(200, { user, stats: { reviews: reviewCount }, recentReviews: reviews }));
});
