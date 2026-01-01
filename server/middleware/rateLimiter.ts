import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../utils/redis'; // Importing our existing ioredis client
import logger from '../utils/logger';

// General API Rate Limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
        // @ts-expect-error - Known issue with types compatibility between ioredis and rate-limit-redis
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
        res.status(options.statusCode).send(options.message);
    },
});

// Strict Rate Limiter for Auth & Payments
export const strictLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 10, // Limit each IP to 10 requests per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-expect-error - Known issue with types compatibility
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
    message: "Too many attempts, please try again later.",
    handler: (req, res, next, options) => {
        logger.warn(`Strict rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
        res.status(options.statusCode).send({ message: options.message });
    },
});
