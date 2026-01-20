import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * This should be called as early as possible in the application lifecycle
 */
export function initSentry(): void {
    // Only initialize if DSN is provided
    const sentryDsn = process.env.SENTRY_DSN;

    if (!sentryDsn) {
        console.warn('⚠️  SENTRY_DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: sentryDsn,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

        // Performance Monitoring
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

        // Release tracking
        release: process.env.npm_package_version || '1.0.0',

        // Filter out sensitive data
        beforeSend(event, hint) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }

            // Remove sensitive query strings
            if (event.request?.query_string) {
                const sanitized = String(event.request.query_string).replace(
                    /token=[^&]*/gi,
                    'token=[REDACTED]'
                );
                event.request.query_string = sanitized;
            }

            return event;
        },
    });

    console.log('✅ Sentry initialized for error tracking');
}

/**
 * Export Sentry instance for manual error capture
 */
export { Sentry };
