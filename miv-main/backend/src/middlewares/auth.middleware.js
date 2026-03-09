import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../config/cache.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/helpers.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  // Check blacklist
  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    throw new ApiError(401, "Token is no longer valid. Please log in again.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token. Please log in again.");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(401, "User account not found.");
  }

  if (user.isBanned) {
    throw new ApiError(403, "Your account has been suspended.");
  }

  req.user = user;
  next();
});

export const adminOnly = asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required.");
  }

  next();
});
