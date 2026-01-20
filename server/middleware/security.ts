import helmet from 'helmet';
import { Application } from 'express';

/**
 * Configure security headers using Helmet.js
 * Protects against common web vulnerabilities
 */
export function configureSecurityHeaders(app: Application): void {
    app.use(helmet({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Next.js
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images (Cloudinary, etc.)
                connectSrc: ["'self'", "https:", "wss:"], // Allow API calls and websockets
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },

        // HTTP Strict Transport Security
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        },

        // Prevent browsers from doing MIME sniffing
        noSniff: true,

        // Prevent clickjacking
        frameguard: {
            action: 'deny'
        },

        // Remove X-Powered-By header
        hidePoweredBy: true,

        // XSS Protection (legacy browsers)
        xssFilter: true,

        // DNS Prefetch Control
        dnsPrefetchControl: {
            allow: false
        },

        // Referrer Policy
        referrerPolicy: {
            policy: 'strict-origin-when-cross-origin'
        }
    }));
}
