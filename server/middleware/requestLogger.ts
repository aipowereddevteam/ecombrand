import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
        }
    }
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const correlationId = uuidv4();
    req.correlationId = correlationId;

    // Add correlationId to response headers so client can see it too
    res.setHeader('X-Correlation-ID', correlationId);

    // Log the incoming request
    logger.http(`Incoming Request: ${req.method} ${req.url}`, { correlationId });

    next();
};

export default requestLogger;
