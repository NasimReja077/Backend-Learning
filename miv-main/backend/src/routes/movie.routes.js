import { Router } from "express";
import {
  trending, search, movieDetails, tvDetails,
  genres, moviesByGenre, popular, topRated,
  getCustomMovies, getCustomMovieById,
} from "../controllers/movie.controller.js";
import { searchRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.get("/trending",              trending);
router.get("/popular",               popular);
router.get("/top-rated",             topRated);
router.get("/search",                searchRateLimiter, search);
router.get("/genres",                genres);
router.get("/genre/:genreId",        moviesByGenre);
router.get("/custom",                getCustomMovies);
router.get("/custom/:id",            getCustomMovieById);
router.get("/tv/:id",                tvDetails);
router.get("/:id",                   movieDetails);

export default router;
