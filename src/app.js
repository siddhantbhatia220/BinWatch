require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dustbinRoutes = require('./routes/dustbinRoutes');
const { updateDustbinHardware } = require('./controllers/dustbinController');

const app = express();

app.use(express.json());
app.use(cors());

// Ensure Database is connected for incoming API requests
app.use(async (req, res, next) => {
    // Only connect DB for API routes or serverless requests
    if (req.path.startsWith('/api')) {
        try {
            await connectDB();
        } catch (err) {
            console.error('Database connection error in middleware:', err);
            return res.status(500).json({
                message: 'Database connection failure',
                error: err.message
            });
        }
    }
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dustbins', dustbinRoutes);

// Hardware specific route (Backward compatibility for ESP8266)
app.post('/api/update', updateDustbinHardware);

// Catch-all route for SPA
app.get(/(.*)/, (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
