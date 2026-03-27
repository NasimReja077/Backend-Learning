import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: String,
  content: String,
  summary: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Content", schema);