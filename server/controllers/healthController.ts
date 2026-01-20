import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redis from '../utils/redis';
import emailWorker from '../workers/emailWorker';

export const checkHealth = async (req: Request, res: Response) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: 'UNKNOWN',
            redis: 'UNKNOWN',
            worker: 'UNKNOWN'
        },
        memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
            external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
        },
        environment: process.env.NODE_ENV || 'development'
    };

    let statusCode = 200;

    // Check MongoDB
    try {
        const dbState = mongoose.connection.readyState;
        // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        healthStatus.services.database = dbState === 1 ? 'UP' : 'DOWN';
        if (dbState !== 1) {
            statusCode = 503;
            healthStatus.status = 'degraded';
        }
    } catch (error) {
        healthStatus.services.database = 'ERROR';
        statusCode = 503;
        healthStatus.status = 'degraded';
    }

    // Check Redis
    try {
        const ping = await redis.ping();
        healthStatus.services.redis = ping === 'PONG' ? 'UP' : 'DOWN';
        if (ping !== 'PONG') {
            statusCode = 503;
            healthStatus.status = 'degraded';
        }
    } catch (error) {
        healthStatus.services.redis = 'ERROR';
        statusCode = 503;
        healthStatus.status = 'degraded';
    }

    // Check BullMQ Worker
    try {
        // @ts-expect-error - isClosed property might not be in type definition but exists at runtime
        if (emailWorker && !emailWorker.isClosed) {
            healthStatus.services.worker = 'UP';
        } else {
            healthStatus.services.worker = 'DOWN';
            // Worker down might not be critical for overall API health
        }
    } catch (error) {
        healthStatus.services.worker = 'ERROR';
    }

    res.status(statusCode).json(healthStatus);
};
