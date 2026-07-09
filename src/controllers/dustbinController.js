const Dustbin = require('../models/Dustbin');
const User = require('../models/User');
const { Resend } = require('resend');

let resendClient = null;

// Initialize Resend lazily so the server can start without it if not needed yet
const getResendClient = () => {
    if (!resendClient && process.env.RESEND_API_KEY) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

// --- Function to send the email alert using Resend ---
async function sendEmailAlert(recipientEmail, dustbin, lat, lng, distance) {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const fromEmail = process.env.FROM_EMAIL || 'alerts@binwatch.com';
    const resend = getResendClient();

    if (!resend) {
        console.warn('RESEND_API_KEY is not configured. Email alert skipped.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `BinWatch Alert <${fromEmail}>`,
            to: [recipientEmail],
            subject: `Dustbin Full Alert: ${dustbin.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>BinWatch - Smart Dustbin Alert</h2>
                    <p>This is an automated alert to inform you that your dustbin, <strong>${dustbin.name}</strong> (ID: ${dustbin.dustbinId}), is now <strong>FULL</strong>.</p>
                    <p>The last sensor reading was <strong>${distance} cm</strong>.</p>
                    <p>Please arrange for it to be emptied.</p>
                    <hr>
                    <h3>Last Known Location:</h3>
                    <p>Coordinates: ${lat}, ${lng}</p>
                    <p><a href="${mapsLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View on Google Maps</a></p>
                    <br>
                    <p style="font-size: 0.9em; color: #777;">Thank you,</p>
                    <p style="font-size: 0.9em; color: #777;">Your BinWatch Monitoring System</p>
                </div>
            `
        });

        if (error) {
            console.error(`Error sending email: ${error.message}`);
            return;
        }

        console.log(`Email alert sent successfully to ${recipientEmail}. ID: ${data.id}`);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
}

const getDustbins = async (req, res) => {
    try {
        const dustbins = await Dustbin.find({ owner: req.user.userId });
        res.json(dustbins);
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
};

const getDustbinById = async (req, res) => {
    try {
        const dustbin = await Dustbin.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!dustbin) {
            return res.status(404).send({ message: 'Dustbin not found or you do not have permission.' });
        }
        
        res.json(dustbin);

    } catch (err) {
        res.status(400).send({ message: "Invalid Dustbin ID format" });
    }
};

const createDustbin = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.user.userId;

        let uniqueId = '';
        let existing = true;
        while (existing) {
            // Generates a random 6-digit hex code
            const randomHex = Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0');
            uniqueId = `DBN-${randomHex}`;
            existing = await Dustbin.findOne({ dustbinId: uniqueId });
        }

        let dustbin = new Dustbin({
            dustbinId: uniqueId,
            name: name,
            owner: ownerId,
        });

        await dustbin.save();
        console.log(`New dustbin registered: ${uniqueId} by user ${req.user.email}`);
        
        // Access broadcastUpdate attached to app by server.js
        if (req.app.locals.broadcastUpdate) {
            req.app.locals.broadcastUpdate(ownerId);
        }

        res.status(201).json(dustbin);

    } catch (err) {
        res.status(500).send({ message: "Server error", error: err.message });
    }
};

const updateDustbinHardware = async (req, res) => {
    const { dustbinId, status, lat, lng, distance } = req.body;
    try {
        const dustbin = await Dustbin.findOne({ dustbinId: dustbinId });

        if (!dustbin) {
            return res.status(404).send({ message: "Device ID not found. Make sure it is registered on the dashboard." });
        }

        // Email Alert Logic: Check if the bin *just became* full
        if (status === 'Full' && dustbin.status !== 'Full') {
            console.log(`Dustbin ${dustbinId} just became full. Preparing email alert...`);
            
            const owner = await User.findById(dustbin.owner);
            if (owner) {
                sendEmailAlert(owner.email, dustbin, lat, lng, distance);
            }
        }

        // Update the dustbin in the database
        dustbin.status = status;
        dustbin.lat = lat;
        dustbin.lng = lng;
        dustbin.distance = distance;
        dustbin.lastUpdated = Date.now();
        await dustbin.save();

        console.log(`Data received from hardware: ${dustbinId}. Status: ${status}, Distance: ${distance}cm`);
        
        if (req.app.locals.broadcastUpdate) {
            req.app.locals.broadcastUpdate(dustbin.owner.toString());
        }

        res.status(200).send({ message: "Data updated" });

    } catch (err) {
        console.error("Error in hardware update:", err);
        res.status(500).send({ message: "Server error" });
    }
};

const getAllDustbinsAdmin = async (req, res) => {
    try {
        const allDustbins = await Dustbin.find().populate('owner', 'email');
        res.json(allDustbins);
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
};

const getAllUsersAdmin = async (req, res) => {
    try {
        const allUsers = await User.find({}, '-password');
        res.json(allUsers);
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
};


module.exports = { 
    getDustbins, 
    getDustbinById, 
    createDustbin, 
    updateDustbinHardware,
    getAllDustbinsAdmin,
    getAllUsersAdmin
};
