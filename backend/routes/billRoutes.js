import express from 'express';
import * as billController from '../controllers/billController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All bill routes require authentication
router.use(authMiddleware);

// GET /api/bills - ดึงบิลทั้งหมด (query: ?room=101)
router.get('/', billController.getAllBills);

// GET /api/bills/stats/dashboard - สถิติสำหรับ Dashboard
router.get('/stats/dashboard', billController.getDashboardStats);

// GET /api/bills/:id - ดึงบิลตาม ID
router.get('/:id', billController.getBillById);

// POST /api/bills - สร้างบิลใหม่
router.post('/', billController.createBill);

// PUT /api/bills/:id - แก้ไขบิล
router.put('/:id', billController.updateBill);

// DELETE /api/bills/bulk - ลบหลายบิล
router.delete('/bulk', billController.deleteMultipleBills);

// DELETE /api/bills/:id - ลบบิล
router.delete('/:id', billController.deleteBill);

export default router;
