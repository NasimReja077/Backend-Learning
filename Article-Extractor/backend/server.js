import express from "express";
import cors from "cors";
import articleRoute from "./routes/article.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/article", articleRoute);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});