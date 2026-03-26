import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/users
export const createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
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

        const user = await User.create({ 
            username, 
            passwordHash: password,
            role: role || 'user'
        });

        res.status(201).json({ id: user._id, username: user.username, role: user.role, status: user.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/users/:id/role-status
export const updateUserRoleStatus = async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

        // Prevent self-demotion from admin
        if (req.userId === user._id.toString() && role === 'user') {
            return res.status(400).json({ error: 'ไม่สามารถลดสิทธิ์ Admin ของตัวเองได้' });
        }
        // Prevent self-suspend
        if (req.userId === user._id.toString() && status === 'suspended') {
            return res.status(400).json({ error: 'ไม่สามารถระงับบัญชีของตัวเองได้' });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();
        res.json({ id: user._id, username: user.username, role: user.role, status: user.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/users/:id/password
export const changeUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

        user.passwordHash = newPassword; // Will be hashed by pre-save hook
        await user.save();
        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

        if (req.userId === user._id.toString()) {
            return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' });
        }

        await user.deleteOne();
        res.json({ message: 'ลบบัญชีสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
