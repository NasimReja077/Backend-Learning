import Favorite from "../models/favorite.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { favorites }));
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { movieData } = req.body;

  const existing = await Favorite.findOne({ userId: req.user._id, movieId });
  if (existing) throw new ApiError(409, "Movie already in favorites");

  const favorite = await Favorite.create({
    userId: req.user._id,
    movieId,
    movieData: movieData || {},
  });
  res.status(201).json(new ApiResponse(201, { favorite }, "Added to favorites"));
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const result = await Favorite.deleteOne({ userId: req.user._id, movieId });
  if (result.deletedCount === 0) throw new ApiError(404, "Favorite not found");
  res.json(new ApiResponse(200, null, "Removed from favorites"));
});

export const checkFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const exists = await Favorite.exists({ userId: req.user._id, movieId });
  res.json(new ApiResponse(200, { isFavorite: !!exists }));
});
