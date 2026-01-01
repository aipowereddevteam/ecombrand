import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import passport from './config/passport';
import { initOrderWatcher } from './utils/orderWatcher';
import requestLogger from './middleware/requestLogger';
import { apiLimiter, strictLimiter } from './middleware/rateLimiter';
import './workers/emailWorker'; // Initialize worker
import logger from './utils/logger';

dotenv.config();

connectDB();

const app: Application = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true
}));

app.use(requestLogger); // Apply request logger globally
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

app.use(express.static('public')); // Serve static files if needed

// Apply Rate Limiters
app.use('/health', healthRoutes); // Health Check (Unversioned)

// Apply Rate Limiters & Versioning
app.use('/api/v1/auth', strictLimiter, authRoutes);
app.use('/api/v1/products', apiLimiter, productRoutes);
app.use('/api/v1/payment', strictLimiter, paymentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);


app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on('join-admin', () => {
        socket.join('admin-room');
        console.log(`Socket ${socket.id} joined admin-room`);
    });

    socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`Socket ${socket.id} joined user-${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});

// Initialize Order Watcher
initOrderWatcher(io);

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful Shutdown Logic
const gracefulShutdown = async () => {
    logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');

    server.close(() => {
        logger.info('Http server closed.');
    });

    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');

        // redis.quit() returns a promise
        await import('./utils/redis').then(r => r.default.quit());
        logger.info('Redis connection closed.');

        // bullmq worker close
        await import('./workers/emailWorker').then(w => w.default.close());
        logger.info('Email Worker closed.');

        process.exit(0);
    } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
