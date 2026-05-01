const express = require('express');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global Error Middleware
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server running on port 3000 🚀");
});