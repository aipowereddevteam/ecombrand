const express = require('express');
const router = express.Router();
const { googleCallback, verifyPhone } = require('../controllers/authController');
const passport = require('passport');

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback URL
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
);

router.post('/verify-phone', passport.authenticate('jwt', { session: false }), verifyPhone);

module.exports = router;
