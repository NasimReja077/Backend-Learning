import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import contentRoutes from "./src/routes/content.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/content", contentRoutes);
app.use("/api/chat", chatRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.listen(5000, () => {
  console.log("Server running on 5000");
});