import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    movieData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

historySchema.index({ user: 1, movieId: 1 }, { unique: true });

const History = mongoose.model("History", historySchema);
export default History;
