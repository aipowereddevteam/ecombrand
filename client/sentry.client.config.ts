import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always capture replays for sessions with errors

    // Release tracking
    release: process.env.npm_package_version || '1.0.0',

    // Filter out sensitive data
    beforeSend(event, hint) {
        // Remove sensitive cookies
        if (event.request?.cookies) {
            delete event.request.cookies['token'];
            delete event.request.cookies['session'];
        }

        // Remove sensitive localStorage keys (if captured in breadcrumbs)
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                if (breadcrumb.data && typeof breadcrumb.data === 'object') {
                    const data = { ...breadcrumb.data };
                    delete data.token;
                    delete data.password;
                    return { ...breadcrumb, data };
                }
                return breadcrumb;
            });
        }

        return event;
    },

    // Ignore common browser errors
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
    ],
});
