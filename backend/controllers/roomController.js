import Room from '../models/Room.js';

// GET /api/rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ userId: req.userId }).sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/rooms/:roomNumber
export const getRoomByNumber = async (req, res) => {
    try {
        const room = await Room.findOne({ roomNumber: req.params.roomNumber, userId: req.userId });
        if (!room) {
            return res.status(404).json({ error: 'ไม่พบห้องนี้' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/rooms
export const createRoom = async (req, res) => {
    try {
        const existing = await Room.findOne({ roomNumber: req.body.roomNumber, userId: req.userId });
        if (existing) {
            return res.status(400).json({ error: 'เลขห้องนี้มีอยู่แล้ว' });
        }
        const room = await Room.create({ ...req.body, userId: req.userId });
        res.status(201).json(room);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'เลขห้องนี้มีอยู่แล้ว' });
        }
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/rooms/:roomNumber
export const updateRoom = async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate(
            { roomNumber: req.params.roomNumber, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!room) {
            return res.status(404).json({ error: 'ไม่พบห้องนี้' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/rooms/:roomNumber
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findOneAndDelete({ roomNumber: req.params.roomNumber, userId: req.userId });
        if (!room) {
            return res.status(404).json({ error: 'ไม่พบห้องนี้' });
        }
        res.json({ message: 'ลบห้องสำเร็จ', room });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/rooms/:roomNumber/meters
export const updateMeters = async (req, res) => {
    try {
        const { waterMeter, electricMeter } = req.body;
        const room = await Room.findOneAndUpdate(
            { roomNumber: req.params.roomNumber, userId: req.userId },
            {
                lastWaterMeter: waterMeter,
                lastElectricMeter: electricMeter,
                lastBillingDate: new Date()
            },
            { new: true }
        );
        if (!room) {
            return res.status(404).json({ error: 'ไม่พบห้องนี้' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
