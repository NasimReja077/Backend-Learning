import express from "express";
import { hybridSearch } from "./search.js";

const app = express();
app.use(express.json());

app.post("/search", (req, res) => {
  const { query } = req.body;

  const results = hybridSearch(query);

  res.json(results);
});

app.listen(3000, () => {
  console.log("Hybrid Search Server Running 🚀");
});