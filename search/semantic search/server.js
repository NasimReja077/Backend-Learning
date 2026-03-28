import express from "express";
import { semanticSearch } from "./search.js";

const app = express();
app.use(express.json());

// API endpoint
app.post("/search", (req, res) => {
  const { query, k } = req.body;

  // Run semantic search
  const results = semanticSearch(query, k || 2);

  res.json({
    query,
    results
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});