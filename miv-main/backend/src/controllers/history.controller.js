import History from "../models/history.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";

export const getHistory = asyncHandler(async (req, res) => {
  const history = await History.find({ user: req.user._id })
    .sort({ watchedAt: -1 })
    .limit(50);

  res.json(new ApiResponse(200, { history }));
});

export const addHistory = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { movieData } = req.body;

  const history = await History.findOneAndUpdate(
    { user: req.user._id, movieId },
    { watchedAt: new Date(), movieData: movieData || {} },
    { returnDocument: "after", upsert: true }
  );

  res
    .status(201)
    .json(new ApiResponse(201, { history }, "Added to watch history"));
});

export const clearHistory = asyncHandler(async (req, res) => {
  await History.deleteMany({ user: req.user._id });

  res.json(new ApiResponse(200, null, "Watch history cleared"));
});