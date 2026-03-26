import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
    getAllUsers,
    createUser,
    updateUserRoleStatus,
    changeUserPassword,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id/role-status', updateUserRoleStatus);
router.put('/:id/password', changeUserPassword);
router.delete('/:id', deleteUser);

export default router;
