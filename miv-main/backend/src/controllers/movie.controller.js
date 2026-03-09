import {
  getTrending,
  searchMulti,
  getMovieDetails,
  getTVDetails,
  getGenres,
  getByGenre,
  getPopular,
  getTopRated,
} from "../services/tmdb.service.js";
import Movie from "../models/movie.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

export const trending = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await getTrending(page);
  res.json(new ApiResponse(200, data));
});

export const search = asyncHandler(async (req, res) => {
  const { query, page } = req.query;
  if (!query?.trim()) throw new ApiError(400, "Search query is required");
  const data = await searchMulti(query, parseInt(page) || 1);
  res.json(new ApiResponse(200, data));
});

export const movieDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await getMovieDetails(id);
  res.json(new ApiResponse(200, data));
});

export const tvDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await getTVDetails(id);
  res.json(new ApiResponse(200, data));
});

// ─── NEW: Genre endpoints ─────────────────────────────────────────────────────
export const genres = asyncHandler(async (_req, res) => {
  const data = await getGenres();
  res.json(new ApiResponse(200, { genres: data }));
});

export const moviesByGenre = asyncHandler(async (req, res) => {
  const { genreId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const data = await getByGenre(genreId, page);
  res.json(new ApiResponse(200, data));
});

export const popular = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await getPopular(page);
  res.json(new ApiResponse(200, data));
});

export const topRated = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await getTopRated(page);
  res.json(new ApiResponse(200, data));
});

// ─── Custom Movies ────────────────────────────────────────────────────────────
export const getCustomMovies = asyncHandler(async (_req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { movies }));
});

export const getCustomMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json(new ApiResponse(200, { movie }));
});
