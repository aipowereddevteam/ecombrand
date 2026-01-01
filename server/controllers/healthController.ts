import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redis from '../utils/redis';
import emailWorker from '../workers/emailWorker';

export const checkHealth = async (req: Request, res: Response) => {
    const healthStatus = {
        timestamp: new Date().toISOString(),
        services: {
            database: 'UNKNOWN',
            redis: 'UNKNOWN',
            worker: 'UNKNOWN'
        }
    };

    let statusCode = 200;

    // Check MongoDB
    try {
        const dbState = mongoose.connection.readyState;
        // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        healthStatus.services.database = dbState === 1 ? 'UP' : 'DOWN';
        if (dbState !== 1) statusCode = 503;
    } catch (error) {
        healthStatus.services.database = 'ERROR';
        statusCode = 503;
    }

    // Check Redis
    try {
        const ping = await redis.ping();
        healthStatus.services.redis = ping === 'PONG' ? 'UP' : 'DOWN';
        if (ping !== 'PONG') statusCode = 503;
    } catch (error) {
        healthStatus.services.redis = 'ERROR';
        statusCode = 503;
    }

    // Check BullMQ Worker
    try {
        // @ts-expect-error - isClosed property might not be in type definition but exists at runtime
        if (emailWorker && !emailWorker.isClosed) {
            healthStatus.services.worker = 'UP';
        } else {
            healthStatus.services.worker = 'DOWN';
            // Worker down might not be critical for overall API health, so keeping 200 if others are fine
        }
    } catch (error) {
        healthStatus.services.worker = 'ERROR';
    }

    res.status(statusCode).json(healthStatus);
};
