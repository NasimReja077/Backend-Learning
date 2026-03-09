import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import movieRouter from "./routes/movie.routes.js";
import favoriteRouter from "./routes/favorite.routes.js";
import historyRouter from "./routes/history.routes.js";
import adminRouter from "./routes/admin.routes.js";
import adminMovieRouter from "./routes/adminMovie.routes.js";
import reviewRouter from "./routes/review.routes.js";
import profileRouter from "./routes/profile.routes.js";

import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Global rate limiter
app.use(globalRateLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/history", historyRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/movies", adminMovieRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/profile", profileRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Flixora", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


app.use('*name', (req, res)=> {
  res.sendFile(path.join(__dirname, "../public/index.html"))
});

export default app;
