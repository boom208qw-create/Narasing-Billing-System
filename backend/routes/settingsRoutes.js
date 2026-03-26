import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All settings routes require authentication
router.use(authMiddleware);


// GET /api/settings - ดึงการตั้งค่าทั้งหมด
router.get('/', settingsController.getSettings);

// PUT /api/settings - บันทึกการตั้งค่า
router.put('/', settingsController.updateSettings);

// GET /api/settings/rates - ดึงอัตราค่าบริการ
router.get('/rates', settingsController.getRates);

// PUT /api/settings/rates - อัพเดตอัตราค่าบริการ
router.put('/rates', settingsController.updateRates);

// PUT /api/settings/rates/apply-all - ใช้อัตราค่าบริการกับทุกห้อง
router.put('/rates/apply-all', settingsController.applyRatesToAllRooms);

export default router;
