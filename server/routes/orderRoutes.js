const express = require('express');
const router = express.Router();
const { newOrder, getSingleOrder, myOrders, updateOrderStatus, getAllOrders, deleteOrder } = require('../controllers/orderController');
const { isAuthenticated, ensurePhoneVerified, authorizeRoles } = require('../middleware/auth');

router.post('/new', isAuthenticated, ensurePhoneVerified, newOrder);
router.get('/me', isAuthenticated, myOrders);
router.get('/:id', isAuthenticated, getSingleOrder);

// Admin Routes
router.route('/admin/order/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateOrderStatus)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteOrder);

router.route('/admin/orders').get(isAuthenticated, authorizeRoles('admin'), getAllOrders);

module.exports = router;
