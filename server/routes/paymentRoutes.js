const express = require('express');
const router = express.Router();
const { processPayment, verifyPayment } = require('../controllers/paymentController');
const { isAuthenticated, ensurePhoneVerified } = require('../middleware/auth');

router.post('/process', isAuthenticated, ensurePhoneVerified, processPayment);
router.post('/verify', isAuthenticated, ensurePhoneVerified, verifyPayment);

module.exports = router;
