import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import noteRoutes from "./src/routes/note.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/notes", noteRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"));

app.listen(8000, () => {
  console.log("Server running on 8000");
});