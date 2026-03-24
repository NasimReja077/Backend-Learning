// index.js
import 'dotenv/config';  // ← This auto-loads .env file into process.env (must be first!)

import express, { json } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import saveRouter from './routes/save.js';  // note .js extension

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // adjust later for browser extension
app.use(json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Routes
app.use('/api', saveRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});