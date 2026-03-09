import User from "../models/user.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { users, total: users.length }));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot delete an admin account");
  await user.deleteOne();
  res.json(new ApiResponse(200, null, "User deleted successfully"));
});

export const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot ban an admin account");
  user.isBanned = !user.isBanned;
  await user.save();
  res.json(
    new ApiResponse(200, { isBanned: user.isBanned },
      `User ${user.isBanned ? "banned" : "unbanned"} successfully`)
  );
});

export const promoteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.role = user.role === "admin" ? "user" : "admin";
  await user.save();
  res.json(new ApiResponse(200, { role: user.role }, `User role updated to ${user.role}`));
});
