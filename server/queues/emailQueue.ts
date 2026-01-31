import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Use Upstash Cloud Redis with fallback
const redisOptions = {
    url: process.env.UPSTASH_REDIS_URL || process.env.REDIS_URI || 'redis://0.0.0.0:6380',
    tls: process.env.UPSTASH_REDIS_URL ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

const emailQueue = new Queue('email-queue', {
    connection: redisOptions
});

export default emailQueue;
