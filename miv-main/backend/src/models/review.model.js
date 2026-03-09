import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    movieTitle: { type: String, default: "" },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    spoiler: { type: Boolean, default: false },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// One review per user per movie
reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
