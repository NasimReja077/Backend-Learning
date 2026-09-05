import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "researching", "writing", "completed", "failed"],
    default: "pending",
  },
  assignedTo: String,
  research: String,
  finalAnswer: String,
  logs: [{ message: String, timestamp: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Task", taskSchema);
