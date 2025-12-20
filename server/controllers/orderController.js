const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new Order
exports.newOrder = async (req, res, next) => {
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

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user.id,
            orderHistory: [{
                status: "Processing",
                timestamp: Date.now(),
                comment: "Order Placed"
            }]
        });

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Create Order Error", error);
        res.status(500).json({ error: "Could not create order" });
    }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({ error: "You have already delivered this order" });
        }

        // If switching to Confirmed, decrease stock
        if (req.body.status === "Confirmed" && order.orderStatus !== "Confirmed") {
            for (const item of order.orderItems) {
                await updateStock(item.product, item.quantity, item.size);
            }
        }

        order.orderStatus = req.body.status;

        order.orderHistory.push({
            status: req.body.status,
            timestamp: Date.now(),
            comment: req.body.comment || ""
        });

        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

async function updateStock(id, quantity, size) {
    const product = await Product.findById(id);

    if (product) {
        if (product.stock && product.stock[size] !== undefined) {
            product.stock[size] -= quantity;
            if (product.stock[size] < 0) product.stock[size] = 0;
            product.markModified('stock');
        }

        await product.save({ validateBeforeSave: false });
    }
}

// Get Single Order
exports.getSingleOrder = async (req, res, next) => {
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
exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res, next) => {
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
exports.deleteOrder = async (req, res, next) => {
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
