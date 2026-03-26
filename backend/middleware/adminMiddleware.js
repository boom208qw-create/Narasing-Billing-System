import User from '../models/User.js';

export const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์ใช้งานหน้านี้ (Admin Only)' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
    }
};
