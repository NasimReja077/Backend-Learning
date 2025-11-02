import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import testSendMail from "./routes/testSendMail.routes.js";

dotenv.config();

// __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VIEW ENGINE SETUP
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/test", testSendMail);

// Root route — render EJS view
app.get("/", (req, res) => {
  res.render("index"); // index.ejs in /src/views/
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
