import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Use the same Redis connection string as the main redis client
const redisOptions = {
    url: process.env.REDIS_URI || 'redis://localhost:6379'
};

const emailQueue = new Queue('email-queue', {
    connection: redisOptions
});

export default emailQueue;
