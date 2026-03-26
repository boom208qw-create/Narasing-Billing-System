import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'กรุณาระบุ username และ password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
        }

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';
        const status = userCount === 0 ? 'active' : 'pending';

        const user = await User.create({ username, passwordHash: password, role, status });

        // If it's the first user (admin), log them in automatically
        if (userCount === 0) {
            const token = generateToken(user);
            return res.status(201).json({
                message: 'สร้างบัญชีผู้ดูแลระบบคนแรกเรียบร้อยแล้ว',
                token,
                user: { id: user._id, username: user.username, role: user.role }
            });
        }

        // For regular users, require approval (do not return token)
        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติบัญชี',
            user: { id: user._id, username: user.username, role: user.role, status: user.status }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
        }
        res.status(500).json({ error: error.message });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'กรุณาระบุ username และ password' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'บัญชีนี้ถูกระงับการใช้งาน' });
        }
        if (user.status === 'pending') {
            return res.status(403).json({ error: 'บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = generateToken(user);
        res.json({
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/auth/me  (verify token is still valid)
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
        res.json({ id: user._id, username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
