import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Release tracking
    release: process.env.npm_package_version || '1.0.0',

    // Filter out sensitive data
    beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
        }

        return event;
    },
});
