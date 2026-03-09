import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    poster: { type: String, default: "" },
    description: {
      type: String,
      default: "Description not available",
    },
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
      unique: true,
    },
    releaseDate: { type: String, default: "Release date not available" },
    trailer: { type: String, default: "" },
    genre: { type: String, default: "Genre not available" },
    category: { type: String, default: "Category not available" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
