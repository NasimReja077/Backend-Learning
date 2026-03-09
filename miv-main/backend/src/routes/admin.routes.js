import { Router } from "express";
import { getAllUsers, deleteUser, toggleBanUser, promoteUser } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.delete("/users/:id",           deleteUser);
router.patch("/users/:id/ban",        toggleBanUser);
router.patch("/users/:id/promote",    promoteUser);

export default router;
