
import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';

// GET /api/admin/analytics/summary
export const getAnalyticsSummary = async (req: Request, res: Response) => {
    try {
        const stats = await Order.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        { $match: { isPaid: true } }, // Or orderStatus: 'Delivered', depending on business logic
                        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                    ],
                    totalOrders: [
                        { $count: "count" }
                    ],
                    avgOrderValue: [
                        { $match: { isPaid: true } },
                        { $group: { _id: null, avg: { $avg: "$totalPrice" } } }
                    ]
                }
            }
        ]);

        const revenue = stats[0].totalRevenue[0]?.total || 0;
        const orders = stats[0].totalOrders[0]?.count || 0;
        const aov = stats[0].avgOrderValue[0]?.avg || 0;

        res.json({
            revenue,
            orders,
            aov
        });
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// GET /api/admin/analytics/sales-trend
export const getSalesTrend = async (req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    ordersCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(trend);
    } catch (error) {
        console.error("Error fetching sales trend:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// GET /api/admin/analytics/top-products
export const getTopProducts = async (req: Request, res: Response) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalSold: { $sum: "$orderItems.quantity" },
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    name: "$productInfo.name",
                    totalSold: 1,
                    revenue: 1,
                    images: "$productInfo.images"
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
