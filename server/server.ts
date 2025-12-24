import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import passport from './config/passport';
import { initOrderWatcher } from './utils/orderWatcher';

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
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);


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

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
