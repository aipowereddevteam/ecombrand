import express from 'express';
import { processPayment, verifyPayment } from '../controllers/paymentController';
import { isAuthenticated, ensurePhoneVerified } from '../middleware/auth';

const router = express.Router();

router.post('/process', isAuthenticated, ensurePhoneVerified, processPayment);
router.post('/verify', isAuthenticated, ensurePhoneVerified, verifyPayment);

export default router;
