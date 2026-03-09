import { Router } from "express";
import { getFavorites, addFavorite, removeFavorite, checkFavorite } from "../controllers/favorite.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/",               getFavorites);
router.get("/check/:movieId", checkFavorite);
router.post("/:movieId",      addFavorite);
router.delete("/:movieId",    removeFavorite);

export default router;
