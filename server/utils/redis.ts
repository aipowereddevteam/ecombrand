import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUri = process.env.REDIS_URI || 'redis://localhost:6380';

const redis = new Redis(redisUri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    console.log('Redis Connected Successfully');
});

redis.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

export default redis;
