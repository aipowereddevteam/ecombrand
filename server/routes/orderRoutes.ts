import express from 'express';
import { newOrder, getSingleOrder, myOrders, updateOrderStatus, getAllOrders, deleteOrder } from '../controllers/orderController';
import { isAuthenticated, ensurePhoneVerified, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.post('/new', isAuthenticated, ensurePhoneVerified, newOrder);
router.get('/me', isAuthenticated, myOrders);
router.get('/:id', isAuthenticated, getSingleOrder);

// Admin Routes
router.route('/admin/order/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateOrderStatus)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteOrder);

router.route('/admin/orders').get(isAuthenticated, authorizeRoles('admin'), getAllOrders);

export default router;
