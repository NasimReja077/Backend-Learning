import { Router } from "express";
import {
  getAllMovies, createMovie, updateMovie, deleteMovie, movieFormValidators,
} from "../controllers/adminMovie.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/",          getAllMovies);
router.post("/",         movieFormValidators, validate, createMovie);
router.put("/:id",       movieFormValidators, validate, updateMovie);
router.delete("/:id",    deleteMovie);

export default router;
