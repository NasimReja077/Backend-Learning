// routes/note.routes.js
import express from "express";
import { addNote, searchNotes } from "../controllers/note.controller.js";

const router = express.Router();

router.post("/add", addNote);
router.post("/search", searchNotes);

export default router;