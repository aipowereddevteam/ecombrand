import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// Prefer Upstash Cloud Redis, fallback to local
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URI || 'redis://0.0.0.0:6380';

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    enableOfflineQueue: true,
    
    // TLS Configuration for Upstash (rediss://)
    tls: redisUrl.startsWith('rediss://') ? {
        rejectUnauthorized: true
    } : undefined,
    
    // Enhanced Retry Strategy with Exponential Backoff
    retryStrategy(times: number) {
        if (times > 10) {
            logger.error('Redis: Max retry attempts reached. Stopping retries.');
            return null; // Stop retrying after 10 attempts
        }
        const delay = Math.min(times * 100, 3000); // Max 3s delay
        logger.warn(`Redis: Retry attempt ${times}, reconnecting in ${delay}ms...`);
        return delay;
    },
    
    // Connection Timeout
    connectTimeout: 10000, // 10 seconds
    
    // Keep Alive
    keepAlive: 30000, // 30 seconds
    
    // Reconnect on Error
    reconnectOnError(err) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.some(e => err.message.includes(e))) {
            logger.warn(`Redis: Reconnecting due to error: ${err.message}`);
            return true;
        }
        return false;
    }
});

// Connection Event Handlers
redis.on('connect', () => {
    logger.info('✅ Redis: Connected successfully to ' + (redisUrl.includes('upstash') ? 'Upstash Cloud' : 'local Redis'));
});

redis.on('ready', () => {
    logger.info('✅ Redis: Client is ready to accept commands');
});

redis.on('error', (err) => {
    logger.error('❌ Redis: Connection error:', {
        message: err.message,
        code: (err as any).code,
        syscall: (err as any).syscall
    });
    // Graceful degradation: Log but don't crash server
});

redis.on('close', () => {
    logger.warn('⚠️  Redis: Connection closed');
});

redis.on('reconnecting', (delay: number) => {
    logger.info(`🔄 Redis: Reconnecting in ${delay}ms...`);
});

redis.on('end', () => {
    logger.error('🛑 Redis: Connection ended permanently');
});

export default redis;
