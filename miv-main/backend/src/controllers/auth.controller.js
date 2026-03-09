import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import User from "../models/user.model.js";
import { blacklistToken } from "../config/cache.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import ApiError from "../utils/ApiError.js";

// ─── Validators ───────────────────────────────────────────────────────────────
export const registerValidators = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidators = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── Controllers ──────────────────────────────────────────────────────────────
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    throw new ApiError(409, "Username or email already exists");
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashed });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  setTokenCookie(res, token);

  res.status(201).json(
    new ApiResponse(201, {
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
    }, "Account created successfully")
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isBanned) {
    throw new ApiError(403, "Your account has been suspended. Contact support.");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  setTokenCookie(res, token);

  res.json(
    new ApiResponse(200, {
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio },
    }, "Logged in successfully")
  );
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, "User fetched"));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    await blacklistToken(token);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json(new ApiResponse(200, null, "Logged out successfully"));
});
