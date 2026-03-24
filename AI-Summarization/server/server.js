import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import articleRoute from "./routes/article.route.js";

dotenv.config();

const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Routes
app.use("/api/article", articleRoute);

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// 🔹 Global Error Handler (optional but good)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ error: err.message });
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});