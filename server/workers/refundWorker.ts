import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import ReturnRequest from '../models/ReturnRequest';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import Product from '../models/Product';
import logger from '../utils/logger';
import redis from '../utils/redis'; // ioredis instance
import dotenv from 'dotenv';

dotenv.config();

const workerMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

interface RefundJobData {
    returnRequestId: string;
    orderId: string;
    userId: string;
    refundAmount: number;
}

const refundWorker = new Worker<RefundJobData>(
    'refund-queue',
    async (job: Job<RefundJobData>) => {
        const { returnRequestId, orderId, userId, refundAmount } = job.data;
        const lockKey = `refund_lock:${orderId}`;
        const lockDuration = 10000; // 10 seconds

        logger.info(`Processing refund job ${job.id} for Order: ${orderId}`);

        // 1. Idempotency Check via Redis Lock (Basic SetNX)
        // Or check if a successful transaction already exists for this ReturnRequest
        const existingTx = await Transaction.findOne({ 
            referenceId: returnRequestId, 
            referenceModel: 'ReturnRequest', 
            status: 'Success' 
        });

        if (existingTx) {
            logger.info(`Refund already processed for ReturnRequest: ${returnRequestId}. Skipping.`);
            return;
        }

        // Acquire Lock
        const acquired = await redis.set(lockKey, 'locked', 'PX', lockDuration, 'NX');
        if (!acquired) {
            throw new Error(`Could not acquire refund lock for Order ${orderId}. Retrying...`);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 2. Call Payment Gateway (Mock for now)
            // In real world: await razorpay.payments.refund(paymentId, { amount: refundAmount * 100 });
            // Simulation:
            const isGatewaySuccess = true; 
            const gatewayTxId = `rfnd_${Math.random().toString(36).substring(7)}`;

            if (!isGatewaySuccess) {
                throw new Error('Payment Gateway Refund Failed');
            }

            // 3. Update Database
            
            // a. Update ReturnRequest
            const returnRequest = await ReturnRequest.findById(returnRequestId).session(session);
            if (!returnRequest) {
                throw new Error('Return Request not found during worker processing');
            }
            returnRequest.status = 'Refunded';
            returnRequest.auditLog.push({
                status: 'Refunded',
                note: `Refund processed successfully via Gateway ID: ${gatewayTxId}`,
                timestamp: new Date()
            });
            await returnRequest.save({ session });

            // b. Create Transaction Record
            await Transaction.create([{
                type: 'Refund',
                amount: refundAmount,
                status: 'Success',
                referenceId: returnRequestId,
                referenceModel: 'ReturnRequest',
                description: `Refund for Order ${orderId}`,
                gatewayTransactionId: gatewayTxId,
                performedBy: undefined // System
            }], { session });

            // c. Update Order Status (Optional, or just add history)
            const order = await Order.findById(orderId).session(session);
            if (order) {
                 // order.orderStatus = 'Returned'; // Or keep as Delivered but add history?
                 // Usually ecom has 'Returned' status.
                 // let's check Order model enum. It's a string.
                 // Let's add history.
                 order.orderHistory.push({
                     status: 'Refunded',
                     comment: 'Refund processed for return request',
                     timestamp: new Date()
                 });
                 // Update status if full return? For now just log history.
                 await order.save({ session });
            }

            // d. Atomic Inventory Restoration
            for (const item of returnRequest.items) {
                // Determine size key if strictly tracking size stock
                // Item has 'product' (ObjectId).
                // Need to match quantity.
                // Assuming 'product' model has stock structure: { S: 0, M: 0... }
                // Return item doesn't explicitly store 'size' in the array object in ReturnRequest schema I made?
                // Wait, I put `quantity` and `images`... I missed `size` in `IReturnItem` in `ReturnRequest.ts`!
                // Critical Catch! The `Order` item has `size`. `ReturnRequest` must track which size is returned to restore stock.
                
                // I need to fetch the Order Item to know the size if I didn't store it.
                // In `ReturnRequest.ts`, `items` has `orderItemId`.
                // I can look up the size from the Order.
                
                if (order && order.orderItems) {
                     const originalItem = order.orderItems.find(oi => (oi as any)._id.toString() === item.orderItemId);
                     if (originalItem && originalItem.size) {
                         const sizeKey = `stock.${originalItem.size}`;
                         await Product.updateOne(
                             { _id: item.product },
                             { $inc: { [sizeKey]: item.quantity } }
                         ).session(session);
                     }
                }
            }

            await session.commitTransaction();
            logger.info(`Refund completed successfully for ${returnRequestId}`);

        } catch (error: any) {
            await session.abortTransaction();
            logger.error(`Refund failed for ${returnRequestId}: ${error.message}`);
            
            // Mark as Refund_Failed in DB if generic error?
            // Or let BullMQ retry.
            // If it's a permanent error (like Validation), maybe update status.
            // For now throw to retry.
            throw error;
        } finally {
            session.endSession();
            await redis.del(lockKey);
        }
    },
    {
        connection: {
            url: process.env.REDIS_URI || 'redis://localhost:6380'
        },
        limiter: {
            max: 5,
            duration: 1000
        },
        lockDuration: 30000 // BullMQ internal lock
    }
);

refundWorker.on('completed', (job) => {
    logger.info(`Refund Job ${job.id} completed`);
});

refundWorker.on('failed', (job, err) => {
    logger.error(`Refund Job ${job?.id} failed: ${err.message}`);
});

export default refundWorker;
