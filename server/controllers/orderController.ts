import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import { IUser } from '../models/User';
import sendEmail from '../utils/sendEmail';


// Create new Order with Atomic Stock Updates
export const newOrder = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        // 1. Atomic Stock Deduction
        for (const item of orderItems) {

            // Construct dynamic key for dot notation, e.g., "stock.M"
            const sizeKey = `stock.${item.size}`;

            const product = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    [sizeKey]: { $gt: 0 }
                },
                {
                    $inc: { [sizeKey]: -item.quantity }
                },
                { session, new: true }
            );

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(409).json({
                    error: `Out of Stock: Item ${item.name} (Size: ${item.size}) is no longer available.`
                });
            }
        }

        // 2. Create Order
        const order = await Order.create([{
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: new Date(),
            user: (req as any).user.id,
            orderHistory: [{
                status: "Processing",
                timestamp: new Date(),
                comment: "Order Placed"
            }]
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Send Order Confirmation Email (Async - don't block response)
        try {
            let userEmail = (req as any).user?.email;
            let userName = (req as any).user?.name;

            // If email missing from token, fetch from DB
            if (!userEmail) {
                const userDoc = await mongoose.model('User').findById((req as any).user.id);
                if (userDoc) {
                    userEmail = (userDoc as any).email;
                    userName = (userDoc as any).name;
                }
            }

            if (userEmail) {
                const message = `Thank you for your order! \n\nOrder ID: ${order[0]._id} \nTransaction ID: ${paymentInfo.id} \nTotal: ₹${order[0].totalPrice}`;

                // Simple HTML Template
                const html = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Order Confirmed!</h2>
                        <p>Hi ${userName},</p>
                        <p>Your order <strong>${order[0]._id}</strong> has been successfully placed.</p>
                        <p><strong>Transaction ID:</strong> ${paymentInfo.id}</p>
                        <h3>Order Summary</h3>
                        <p>Total: <strong>₹${order[0].totalPrice}</strong></p>
                        <p>Status: Processing</p>
                        <a href="${process.env.FRONTEND_URL}/orders/${order[0]._id}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
                    </div>
                `;

                await sendEmail({
                    email: userEmail,
                    subject: "ShopMate - Invoice & Order Summary",
                    message,
                    html
                });
            } else {
                console.warn("User email not found (even after DB fetch), skipping confirmation email.");
            }
        } catch (emailError) {
            console.error("Email sending failed", emailError);
        }

        res.status(201).json({
            success: true,
            order: order[0], // Order.create with array returns array
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create Order Error", error);
        res.status(500).json({ error: "Could not create order" });
    }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({ error: "You have already delivered this order" });
        }

        /* Stock is now deducted at order creation
        if (req.body.status === "Confirmed" && order.orderStatus !== "Confirmed") {
            for (const item of order.orderItems) {
                await updateStock(item.product.toString(), item.quantity, item.size);
            }
        }
        */

        // Validation for Shipped status
        if (req.body.status === "Shipped") {
            if (!req.body.courierName || !req.body.trackingId) {
                return res.status(400).json({
                    error: "Courier Name and Tracking ID are required when marking as Shipped"
                });
            }
            order.courierName = req.body.courierName;
            order.trackingId = req.body.trackingId;
        }

        order.orderStatus = req.body.status;

        order.orderHistory.push({
            status: req.body.status,
            timestamp: new Date(Date.now()),
            comment: req.body.comment || "",
            updatedBy: (req as any).user.id // Track Admin ID
        });

        if (req.body.status === "Delivered") {
            order.deliveredAt = new Date(Date.now());
        }

        await order.save({ validateBeforeSave: false });

        // Trigger Email Notification (Nodemailer) based on status
        if (req.body.status === 'Shipped' || req.body.status === 'Packing' || req.body.status === 'Delivered') {
            try {
                // Populate user to get email
                const fullOrder = await Order.findById(req.params.id).populate('user', 'name email');

                console.log(`DEBUG: ${req.body.status} Email Triggered for Order:`, req.params.id);

                if (fullOrder && fullOrder.user) {
                    const userEmail = (fullOrder.user as any).email;
                    const userName = (fullOrder.user as any).name;

                    if (!userEmail) {
                        console.error(`DEBUG: Stats: ${req.body.status}. Error: User email is undefined/null in order.user`);
                        return; // Stop here if no email
                    }

                    let subject = "";
                    let message = "";
                    let html = "";

                    if (req.body.status === 'Packing') {
                        subject = "ShopMate - We are packing your order!";
                        message = `We are preparing your package! Your order #${fullOrder._id} is being packed and will be shipped soon.`;
                        html = `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>We are preparing your package! 📦</h2>
                                <p>Hi ${userName},</p>
                                <p>Good news! Your order <strong>#${fullOrder._id}</strong> is currently being packed by our team.</p>
                                <p>It will be shipped shortly.</p>
                                <a href="${process.env.FRONTEND_URL}/orders/${fullOrder._id}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
                            </div>
                        `;
                    } else if (req.body.status === 'Shipped') {
                        subject = "ShopMate - Order Dispatched";
                        message = `Your order has been shipped! \n\nCourier: ${req.body.courierName} \nTracking ID: ${req.body.trackingId}`;
                        html = `
                             <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>Your Order is on the way! 🚚</h2>
                                <p>Hi ${userName},</p>
                                <p>Good news! Your order has been dispatched.</p>
                                <p><strong>Courier:</strong> ${req.body.courierName}</p>
                                <p><strong>Tracking ID:</strong> ${req.body.trackingId}</p>
                                <a href="${process.env.FRONTEND_URL}/orders/${fullOrder._id}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a>
                            </div>
                        `;
                    } else if (req.body.status === 'Delivered') {
                        subject = "ShopMate - Order Delivered";
                        message = `Delivered! Your order #${fullOrder._id} has been delivered. Hope you love your new clothes!`;
                        html = `
                             <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>Delivered! 🎉</h2>
                                <p>Hi ${userName},</p>
                                <p>Your order <strong>#${fullOrder._id}</strong> has been delivered.</p>
                                <p>We hope you love your new clothes! Don't forget to leave a review.</p>
                                <a href="${process.env.FRONTEND_URL}/orders/${fullOrder._id}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
                            </div>
                        `;
                    }

                    console.log(`DEBUG: Sending ${req.body.status} email to ${userEmail}`);
                    await sendEmail({
                        email: userEmail,
                        subject: subject,
                        message,
                        html
                    });
                } else {
                    console.error("DEBUG: Order or User not found during email trigger");
                }
            } catch (error) {
                console.error(`${req.body.status} email failed`, error);
            }
        }

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

async function updateStock(id: string, quantity: number, size: string) {
    const product = await Product.findById(id);

    if (product) {
        // Need to cast product.stock or ensure it is treated as having index signature if needed, but 'size' should match keys.
        // Product stock is typed as object with keys.
        // We can cast `size` to keyof typeof product.stock if we trust input.
        if (product.stock && (product.stock as any)[size] !== undefined) {
            (product.stock as any)[size] -= quantity;
            if ((product.stock as any)[size] < 0) (product.stock as any)[size] = 0;
            product.markModified('stock');
        }

        await product.save({ validateBeforeSave: false });
    }
}

// Get Single Order
export const getSingleOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({ error: "Order not found with this Id" });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

// Get logged in user orders
export const myOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req as any).user || !(req as any).user.id) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const orders = await Order.find({ user: (req as any).user.id });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("myOrders Error", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Get All Orders (Admin)
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0;
        orders.forEach((order) => {
            totalAmount += order.totalPrice;
        });

        res.status(200).json({
            success: true,
            totalAmount,
            orders,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

// Delete Order (Admin)
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found with this Id" });
        }

        await order.deleteOne();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};
