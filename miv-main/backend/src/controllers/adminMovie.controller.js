import { body } from "express-validator";
import Movie from "../models/movie.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

export const movieFormValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("trailer").optional().trim(),
  body("poster").optional().trim(),
  body("genre").optional().trim(),
  body("category").optional().trim(),
  body("description").optional().trim(),
  body("releaseDate").optional().trim(),
];

export const getAllMovies = asyncHandler(async (_req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { movies, total: movies.length }));
});

export const createMovie = asyncHandler(async (req, res) => {
  const { title, description, releaseDate, trailer, genre, category, poster } = req.body;

  const existing = await Movie.findOne({ title });
  if (existing) throw new ApiError(409, "A movie with this title already exists");

  const movieId = `flixora_${Date.now()}`;
  const movie = await Movie.create({
    title, description, releaseDate, trailer, genre, category, poster, movieId,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { movie }, "Movie created successfully"));
});

export const updateMovie = asyncHandler(async (req, res) => {
  const { title, description, releaseDate, trailer, genre, category, poster } = req.body;
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { title, description, releaseDate, trailer, genre, category, poster },
    { new: true, runValidators: true }
  );
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json(new ApiResponse(200, { movie }, "Movie updated successfully"));
});

export const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json(new ApiResponse(200, null, "Movie deleted successfully"));
});
