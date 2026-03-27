import express from "express";
import { addFromURL } from "../controllers/content.controller.js";

const router = express.Router();

router.post("/url", addFromURL);

export default router;