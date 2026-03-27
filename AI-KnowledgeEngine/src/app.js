import express from "express";
import cors from "cors";
import contentRoutes from "./routes/content.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/content", contentRoutes);
app.use("/api/chat", chatRoutes);

export default app;