require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dustbinRoutes = require('./routes/dustbinRoutes');
const { updateDustbinHardware } = require('./controllers/dustbinController');
const Dustbin = require('./models/Dustbin');

// --- 1. CONFIGURATION ---
const app = express();
app.use(express.json());

// Enable CORS for API routes if needed, but since we serve public/ from here, 
// we might not strictly need it. Keeping it permissive for development.
app.use(cors());

// --- 2. DATABASE CONNECTION ---
connectDB();

// --- 3. SERVE STATIC FRONTEND ---
// Serve files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// --- 4. API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/dustbins', dustbinRoutes);

// Hardware specific route (Backward compatibility for ESP8266)
app.post('/api/update', updateDustbinHardware);

// For any other route not handled by API, send index.html (SPA fallback)
app.get(/(.*)/, (req, res) => {
    // Exclude API routes from this fallback
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- 5. WEB SOCKETS & SERVER START ---
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
    const token = req.url.split('?token=')[1];
    if (!token) {
        ws.close();
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        clients.set(userId, ws);
        console.log(`Dashboard client connected: ${decoded.email}`);
        ws.on('close', () => {
            clients.delete(userId);
            console.log(`Dashboard client disconnected: ${decoded.email}`);
        });
    } catch (ex) {
        ws.close();
    }
});

// Broadcast function to update connected clients
async function broadcastUpdate(userId) {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        try {
            const userDustbins = await Dustbin.find({ owner: userId });
            ws.send(JSON.stringify(userDustbins));
        } catch (error) {
            console.error("Error fetching or broadcasting dustbins:", error);
        }
    }
}

// Make broadcast available to controllers
app.locals.broadcastUpdate = broadcastUpdate;
