import Bill from '../models/Bill.js';
import Room from '../models/Room.js';

// GET /api/bills
export const getAllBills = async (req, res) => {
    try {
        const filter = { userId: req.userId };
        if (req.query.room) {
            filter.roomNumber = req.query.room;
        }
        const bills = await Bill.find(filter).sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/bills/:id
export const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.id, userId: req.userId });
        if (!bill) {
            return res.status(404).json({ error: 'ไม่พบบิลนี้' });
        }
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/bills
export const createBill = async (req, res) => {
    try {
        const bill = await Bill.create({ ...req.body, userId: req.userId });
        res.status(201).json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/bills/:id
export const updateBill = async (req, res) => {
    try {
        const bill = await Bill.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!bill) {
            return res.status(404).json({ error: 'ไม่พบบิลนี้' });
        }
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/bills/:id
export const deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!bill) {
            return res.status(404).json({ error: 'ไม่พบบิลนี้' });
        }
        res.json({ message: 'ลบบิลสำเร็จ', bill });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/bills/bulk  (body: { ids: [...] })
export const deleteMultipleBills = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'กรุณาระบุ IDs ของบิลที่ต้องการลบ' });
        }
        // Guard: only delete bills belonging to this user
        const result = await Bill.deleteMany({ _id: { $in: ids }, userId: req.userId });
        res.json({ message: `ลบบิลสำเร็จ ${result.deletedCount} รายการ`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/bills/stats/dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const rooms = await Room.find({ userId: req.userId });
        const bills = await Bill.find({ userId: req.userId });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const billsThisMonth = bills.filter(b => {
            const d = new Date(b.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);
        const monthRevenue = billsThisMonth.reduce((sum, b) => sum + (b.total || 0), 0);

        const occupiedRooms = rooms.filter(r => r.isOccupied).length;
        const vacantRooms = rooms.filter(r => !r.isOccupied).length;

        res.json({
            totalRooms: rooms.length,
            occupiedRooms,
            vacantRooms,
            totalBills: bills.length,
            billsThisMonth: billsThisMonth.length,
            totalRevenue,
            monthRevenue,
            recentBills: [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
            roomsList: rooms.map(r => ({
                roomNumber: r.roomNumber,
                isOccupied: r.isOccupied,
                tenantName: r.tenantName
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
