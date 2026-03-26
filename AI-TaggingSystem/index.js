import 'dotenv/config';
import express from "express";
import tagRouter from "./tagRouter.js"; // Name of your router file

const app = express();
app.use(express.json()); // Essential to read req.body

app.use("/", tagRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});