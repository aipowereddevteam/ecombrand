import express from 'express';
import { googleCallback, verifyPhone } from '../controllers/authController';
import passport from 'passport';

const router = express.Router();

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback URL
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
);

router.post('/verify-phone', passport.authenticate('jwt', { session: false }), verifyPhone);

export default router;
