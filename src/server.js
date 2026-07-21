require('dotenv').config();
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const app = require('./app');
const connectDB = require('./config/db');
const Dustbin = require('./models/Dustbin');

const PORT = process.env.PORT || 3000;

// Connect DB at server startup when running long-lived Node process
connectDB().catch(err => {
    console.error('Failed initial MongoDB connection:', err.message);
});

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

module.exports = app;
