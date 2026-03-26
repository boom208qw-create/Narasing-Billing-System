import express from 'express';
import * as roomController from '../controllers/roomController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All room routes require authentication
router.use(authMiddleware);

// GET /api/rooms - ดึงห้องทั้งหมด
router.get('/', roomController.getAllRooms);

// GET /api/rooms/:roomNumber - ดึงข้อมูลห้องตามเลขห้อง
router.get('/:roomNumber', roomController.getRoomByNumber);

// POST /api/rooms - เพิ่มห้องใหม่
router.post('/', roomController.createRoom);

// PUT /api/rooms/:roomNumber - แก้ไขข้อมูลห้อง
router.put('/:roomNumber', roomController.updateRoom);

// DELETE /api/rooms/:roomNumber - ลบห้อง
router.delete('/:roomNumber', roomController.deleteRoom);

// PUT /api/rooms/:roomNumber/meters - อัพเดตมิเตอร์
router.put('/:roomNumber/meters', roomController.updateMeters);

export default router;
