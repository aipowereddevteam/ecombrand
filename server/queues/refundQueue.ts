import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const redisOptions = {
    url: process.env.UPSTASH_REDIS_URL || process.env.REDIS_URI || 'redis://0.0.0.0:6380',
    // TLS for Upstash
    tls: process.env.UPSTASH_REDIS_URL ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

const refundQueue = new Queue('refund-queue', {
    connection: redisOptions
});

refundQueue.on('error', (err) => {
    logger.error('Refund Queue Error:', err);
});

export default refundQueue;
