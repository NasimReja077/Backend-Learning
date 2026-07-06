import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

import connectDB from "./config/database.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


const PORT = process.env.PORT || 5000
const startServer = async () => {
  await connectDB();
  app.listen(PORT,() => {
    console.log(`🚀 Server running on port ${PORT}`);
});
};

startServer();