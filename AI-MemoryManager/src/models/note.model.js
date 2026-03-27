import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  content: String,
  tags: [String],
  embedding: [Number],
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);