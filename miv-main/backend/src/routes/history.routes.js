import { Router } from "express";
import { getHistory, addHistory, clearHistory } from "../controllers/history.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/",           getHistory);
router.post("/:movieId",  addHistory);
router.delete("/",        clearHistory);

export default router;
