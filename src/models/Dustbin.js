const mongoose = require('mongoose');

const dustbinSchema = new mongoose.Schema({
    dustbinId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, default: 'Offline' },
    distance: { type: Number, default: 0 },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Dustbin', dustbinSchema);
