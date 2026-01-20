import express from 'express';
import { Sentry } from '../config/sentry';

const router = express.Router();

/**
 * Test endpoint to verify Sentry error tracking
 * GET /api/v1/test/sentry-error
 */
router.get('/sentry-error', (req, res) => {
    // Manually capture a test error
    const testError = new Error('🧪 Test error from Sentry verification endpoint');
    Sentry.captureException(testError);

    res.json({
        success: true,
        message: 'Test error sent to Sentry',
        note: 'Check your Sentry dashboard at https://sentry.io',
        timestamp: new Date().toISOString()
    });
});

/**
 * Test endpoint that throws an unhandled error
 * GET /api/v1/test/sentry-crash
 */
router.get('/sentry-crash', (req, res) => {
    throw new Error('🧪 Unhandled exception test for Sentry');
});

export default router;
