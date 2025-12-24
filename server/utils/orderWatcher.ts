import { Server } from 'socket.io';
import Order from '../models/Order';
import Notification from '../models/Notification';

export const initOrderWatcher = (io: Server) => {
    const changeStream = Order.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change: any) => {
        if (change.operationType === 'insert') {
            const order: any = change.fullDocument;

            // Only notify for paid orders or as per requirement. 
            // For now, notifying for all new orders.

            const message = `New Order Placed: ₹${order.totalPrice}`;
            const link = `/admin/orders/${order._id}`;

            try {
                // 1. Create Notification in DB
                const notification = await Notification.create({
                    message,
                    link,
                    isRead: false
                });

                // 2. Broadcast to Admin Room
                io.to('admin-room').emit('new-order', {
                    _id: notification._id,
                    message,
                    link,
                    createdAt: notification.createdAt,
                    orderId: order._id,
                    amount: order.totalPrice
                });

                console.log(`Notification emitted for Order ${order._id}`);

            } catch (error) {
                console.error("Error creating notification:", error);
            }
        }

        else if (change.operationType === 'update') {
            // Need 'updateLookup' to get full document (already enabled)
            const order: any = change.fullDocument;
            const updatedFields = change.updateDescription.updatedFields;

            // Check if orderStatus changed
            if (updatedFields && updatedFields.orderStatus) {
                const newStatus = updatedFields.orderStatus;
                const userId = order.user; // Ensure Order schema has user ref populated or ID stored

                console.log(`Order ${order._id} status updated to ${newStatus}`);

                // Emit to User Room
                if (userId) {
                    io.to(`user-${userId}`).emit('order-updated', {
                        orderId: order._id,
                        status: newStatus,
                        message: `Your order #${order._id} is now ${newStatus}`
                    });
                    console.log(`Emitting order-updated to user-${userId}`);
                }
            }
        }
    });

    changeStream.on('error', (error: any) => {
        console.error("Order Watcher Error:", error);
    });
};
