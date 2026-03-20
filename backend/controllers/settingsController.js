import Settings from '../models/Settings.js';
import Room from '../models/Room.js';

// GET /api/settings
export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getAll();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/settings
export const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.setMultiple(req.body);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/settings/rates
export const getRates = async (req, res) => {
    try {
        const all = await Settings.getAll();
        res.json({
            waterRate: Number(all.waterRate) || 18,
            electricRate: Number(all.electricRate) || 8,
            roomRent: Number(all.roomRent) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/settings/rates
export const updateRates = async (req, res) => {
    try {
        const { waterRate, electricRate, roomRent } = req.body;
        const updates = {};
        if (waterRate !== undefined) updates.waterRate = Number(waterRate);
        if (electricRate !== undefined) updates.electricRate = Number(electricRate);
        if (roomRent !== undefined) updates.roomRent = Number(roomRent);
        const settings = await Settings.setMultiple(updates);
        res.json({
            waterRate: Number(settings.waterRate) || 18,
            electricRate: Number(settings.electricRate) || 8,
            roomRent: Number(settings.roomRent) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/settings/rates/apply-all
export const applyRatesToAllRooms = async (req, res) => {
    try {
        const { waterRate, electricRate, roomRent } = req.body;
        const updates = {};
        if (waterRate !== undefined) updates.waterRate = Number(waterRate);
        if (electricRate !== undefined) updates.electricRate = Number(electricRate);
        if (roomRent !== undefined) updates.roomRent = Number(roomRent);

        await Room.updateMany({}, { $set: updates });
        const rooms = await Room.find({}).sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
