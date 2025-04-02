const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 9000;

mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => { 
    console.log('Connected to MongoDB successfully!');
})
.catch(err => { 
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
});

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

// Middleware
const { logger } = require('./middlewares/logs');
const { checkAuthCookie } = require('./middlewares/authentication');

app.use(logger("log.txt"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Routes
const userRouter = require('./routes/user');

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ExamEase API is running',
        version: '1.0.0'
    });
});

app.use('/user', userRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

const server = app.listen(PORT, (error) => {
    if(error){
        console.error("Error starting server:", error);
        process.exit(1);
    }
    console.log(`\n\nServer is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed. Exiting process...');
        mongoose.connection.close(false, () => {
            process.exit(0);
        });
    });
});