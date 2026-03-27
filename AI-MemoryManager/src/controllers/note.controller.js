// controllers/note.controller.js
import Note from "../models/note.model.js";
import { improveTags, createEmbedding } from "../services/ai.service.js";

// Add Note
export const addNote = async (req, res) => {
  const { content, tags } = req.body;

  const cleanTaags = await improveTags(tags);
  const embedding = await createEmbedding(content);

  const note = await Note.create({
    content,
    tags: cleanTaags,
    embedding,
  });

  res.json(note);
}

// 🔍 Resurface Notes
export const searchNotes = async (req, res) => {
     const { query } = req.body;

     const queryEmbedding = await createEmbedding(query);
     const notes = await Note.find();

     const results = notes.map(note => {
          const similarity = dotProduct(queryEmbedding, note.embedding);
          const daysOld = (Date.now() - note.createdAt) / (1000 * 60 * 60 * 24);
          const recency = 1 / (1 + daysOld);
          const score = (0.7 * similarity) + (0.3 * recency);
          return { ...note.toObject(), score };
     });

     results.sort((a, b) => b.score - a.score);
     res.json(results.slice(0, 5));
}

// helper
const dotProduct = (a, b) => {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
};