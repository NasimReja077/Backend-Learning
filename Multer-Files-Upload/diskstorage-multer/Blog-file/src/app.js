import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import blogRoutes from './routes/blogRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({
  path: '../.env',
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); 

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// Routes
app.use('/', blogRoutes);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));