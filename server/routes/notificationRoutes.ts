import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.get('/', isAuthenticated, authorizeRoles('admin'), getNotifications);
router.put('/:id/read', isAuthenticated, authorizeRoles('admin'), markAsRead);
router.put('/read-all', isAuthenticated, authorizeRoles('admin'), markAllAsRead);

export default router;
