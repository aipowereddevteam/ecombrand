import { Request, Response } from 'express';
import ReturnRequest from '../models/ReturnRequest';
import Order from '../models/Order';
import { startSession } from 'mongoose';
import logger from '../utils/logger';
import refundQueue from '../queues/refundQueue';

// Constants for Return Window (e.g., 7 days)
const RETURN_WINDOW_DAYS = 7;

export const requestReturn = async (req: Request, res: Response): Promise<void> => {
    const { orderId, items, reason } = req.body; // items: [{ orderItemId, quantity, reason, condition, images }]
    const userId = (req as any).user._id;

    if (!items || items.length === 0) {
        res.status(400).json({ success: false, message: 'No items specified for return' });
        return;
    }

    try {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        if (order.orderStatus !== 'Delivered') {
            res.status(400).json({ success: false, message: 'Order must be delivered to request a return' });
            return;
        }

        // Check Return Window
        if (order.deliveredAt) {
            const deliveryDate = new Date(order.deliveredAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > RETURN_WINDOW_DAYS) {
                res.status(400).json({ success: false, message: `Return window closed (${RETURN_WINDOW_DAYS} days)` });
                return;
            }
        } else {
             // Fallback if deliveredAt is missing but status is Delivered (should generally not happen)
             // Allow for now or log warning
        }

        // Calculate estimated refund amount (simplified logic: sum of item prices)
        // In a real scenario, handle discounts/shipping partials
        let totalRefundAmount = 0;
        const returnItems = [];

        for (const item of items) {
            const orderItem = order.orderItems.find(oi => (oi as any)._id.toString() === item.orderItemId);
            if (!orderItem) {
                 res.status(400).json({ success: false, message: `Order item ${item.orderItemId} not found in this order` });
                 return;
            }
            
            // Check if quantity is valid
            if (item.quantity > orderItem.quantity) {
                res.status(400).json({ success: false, message: 'Return quantity cannot exceed order quantity' });
                return;
            }

            // Check if already returned? (Requires checking previous ReturnRequests for this order)
            // Skipping complex check for MVP, but should be added.

            totalRefundAmount += orderItem.price * item.quantity;
            
            returnItems.push({
                orderItemId: item.orderItemId,
                product: orderItem.product as any,
                quantity: item.quantity,
                reason: item.reason || reason,
                condition: item.condition,
                images: item.images
            });
        }

        const returnRequest = await ReturnRequest.create({
            order: orderId,
            user: userId,
            items: returnItems,
            refundAmount: totalRefundAmount,
            status: 'Requested',
            auditLog: [{
                status: 'Requested',
                updatedBy: userId,
                note: 'User initiated return',
                timestamp: new Date()
            }]
        });

        res.status(201).json({ success: true, returnRequest });

    } catch (error: any) {
        logger.error('Error requesting return:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateQCStatus = async (req: Request, res: Response): Promise<void> => {
    const { returnRequestId, status, notes, rejectionReason } = req.body;
    const userId = (req as any).user._id;

    // RBAC Check: Middleware should ideally handle this, but double check
    // Assuming route is protected by checkPermission('QC_Module') or role='warehouse'

    if (!['QC_Passed', 'QC_Failed'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid QC status' });
        return;
    }

    const session = await startSession();
    session.startTransaction();

    try {
        const returnRequest = await ReturnRequest.findById(returnRequestId).session(session);
        if (!returnRequest) {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ success: false, message: 'Return request not found' });
            return;
        }

        if (returnRequest.status !== 'Requested' && returnRequest.status !== 'Pickup_Scheduled' && returnRequest.status !== 'QC_Pending') {
             // Assuming flow: Requested -> (Pickup) -> QC. 
             // If already Refunding/Refunded, can't change via this API.
             await session.abortTransaction();
             session.endSession();
             res.status(400).json({ success: false, message: `Cannot update QC for status: ${returnRequest.status}` });
             return;
        }

        returnRequest.status = status;
        returnRequest.qcNotes = notes;
        returnRequest.qcBy = userId;
        if (status === 'QC_Failed') {
            returnRequest.rejectionReason = rejectionReason;
        }

        returnRequest.auditLog.push({
            status: status,
            updatedBy: userId,
            note: notes,
            timestamp: new Date()
        });

        await returnRequest.save({ session });

        if (status === 'QC_Passed') {
            // Trigger Refund Job
            await refundQueue.add('process-refund', {
                returnRequestId: returnRequest._id,
                orderId: returnRequest.order,
                userId: returnRequest.user,
                refundAmount: returnRequest.refundAmount
            }, {
                jobId: `refund-${returnRequest._id}` // Ensure uniqueness in queue
            });
            logger.info(`Refund job added for ReturnRequest: ${returnRequest._id}`);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: `QC updated to ${status}` });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        logger.error('Error updating QC status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getReturnRequests = async (req: Request, res: Response): Promise<void> => {
    // Admin/Warehouse/Accountant can list.
    // User can list their own.
    
    // Simplification for MVP:
    // If Admin/Warehouse -> list all (optionally filter by status)
    // If User -> list own.
    
    const userRole = (req as any).user.role;
    const userId = (req as any).user._id;
    const { status } = req.query;

    const query: any = {};

    if (userRole === 'user') {
        query.user = userId;
    }

    if (status) {
        query.status = status;
    }

    try {
        const requests = await ReturnRequest.find(query)
            .populate('order', 'orderItems') // Minimal populate
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, requests });
    } catch (error: any) {
        logger.error('Error fetching return requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
