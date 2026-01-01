import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const redisOptions = {
    url: process.env.REDIS_URI || 'redis://localhost:6380'
};

const refundQueue = new Queue('refund-queue', {
    connection: redisOptions
});

refundQueue.on('error', (err) => {
    logger.error('Refund Queue Error:', err);
});

export default refundQueue;
