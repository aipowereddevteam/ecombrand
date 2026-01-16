import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import logger from '../utils/logger';

// Helper to parse date range
const getDateRange = (req: Request) => {
    const { range, startDate, endDate } = req.query;
    const now = new Date();
    let start: Date, end: Date = now;

    if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
    } else {
        switch (range) {
            case '7days': start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
            case '90days': start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
            case '30days': default: start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        }
    }
    return { startDate: start, endDate: end };
};

// GET /api/v1/admin/reports/customers
export const getCustomerAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // 1. Acquisition & Churn Stats
        const customerStats = await User.aggregate([
            { $match: { role: 'user' } },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    newThisPeriod: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        { $count: "count" }
                    ],
                    churnRisk: [
                        // Users who haven't ordered in 90 days. 
                        // Note: This requires looking up their last order. Complex in one go.
                        // Simplified approach: Get all users, looking up orders.
                        {
                            $lookup: {
                                from: 'orders',
                                localField: '_id',
                                foreignField: 'user',
                                as: 'orders'
                            }
                        },
                        // Filter users with >0 orders but last order > 90 days ago
                        {
                            $addFields: {
                                lastOrderDate: { $max: "$orders.createdAt" }
                            }
                        },
                        {
                            $match: {
                                lastOrderDate: { 
                                    $exists: true, 
                                    $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
                                }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const totalCustomers = customerStats[0].total[0]?.count || 0;
        const newCustomers = customerStats[0].newThisPeriod[0]?.count || 0;
        const churnedCustomers = customerStats[0].churnRisk[0]?.count || 0;

        // 2. Customer Segmentation (RFM-style Lite)
        // VIP: > 5 orders OR > 50,000 spent
        // Active: Ordered in last 30 days
        const segments = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSpent: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 },
                    lastOrder: { $max: "$createdAt" }
                }
            },
            {
                $project: {
                    segment: {
                        $switch: {
                            branches: [
                                { case: { $gte: ["$totalSpent", 50000] }, then: "VIP" },
                                { case: { $gte: ["$orderCount", 5] }, then: "Loyal" },
                                { case: { $gte: ["$lastOrder", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, then: "Active" }
                            ],
                            default: "Occasional"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$segment",
                    count: { $sum: 1 }
                }
            }
        ]);

        const segmentData = {
            VIP: 0,
            Loyal: 0,
            Active: 0,
            Occasional: 0
        };
        segments.forEach((s: any) => {
            if (s._id) (segmentData as any)[s._id] = s.count;
        });

        // 3. Customer Lifetime Value (Top 5)
        const topCustomers = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSpent: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalPrice" }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    name: "$userInfo.name",
                    email: "$userInfo.email",
                    totalSpent: 1,
                    orderCount: 1,
                    avgOrderValue: 1
                }
            }
        ]);

        res.json({
            success: true,
            summary: {
                totalCustomers,
                newCustomers,
                growthRate: totalCustomers > 0 ? ((newCustomers / totalCustomers) * 100).toFixed(1) : 0,
                churnRate: totalCustomers > 0 ? ((churnedCustomers / totalCustomers) * 100).toFixed(1) : 0,
            },
            segments: segmentData,
            topCustomers
        });

    } catch (error: any) {
        logger.error('Error fetching customer analytics:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/marketing
export const getMarketingAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // 1. Discount Impact Analysis
        // Infer discount if totalPrice < (items + tax + shipping)
        // Since we don't have explicit discount field, checking for price discrepancy
        const discountStats = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $project: {
                    totalPrice: 1,
                    expectedPrice: { $add: ["$itemsPrice", "$taxPrice", "$shippingPrice"] }
                }
            },
            {
                $project: {
                    totalPrice: 1,
                    discountAmount: { $subtract: ["$expectedPrice", "$totalPrice"] },
                    hasDiscount: { $lt: ["$totalPrice", "$expectedPrice"] }
                }
            },
            { $match: { hasDiscount: true, discountAmount: { $gt: 1 } } }, // Filter strict discounts > 1
            {
                $group: {
                    _id: null,
                    totalDiscountGiven: { $sum: "$discountAmount" },
                    discountedOrdersCount: { $sum: 1 },
                    totalRevenueFromDiscounted: { $sum: "$totalPrice" }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const summary = discountStats[0] || { totalDiscountGiven: 0, discountedOrdersCount: 0, totalRevenueFromDiscounted: 0 };

        // 2. Acquisition Channels (Mocked based on Requirements in dash.md as we don't track UTM parameters yet)
        // Ideally this comes from User.utm_source or similar
        const acquisitionChannels = [
            { name: 'Organic Search', value: 45, fill: '#0088FE' },
            { name: 'Google Ads', value: 25, fill: '#00C49F' },
            { name: 'Direct', value: 15, fill: '#FFBB28' },
            { name: 'Social Media', value: 10, fill: '#FF8042' },
            { name: 'Referral', value: 5, fill: '#8884d8' },
        ];

        // 3. Campaign ROI (Mocked for Demo as per dash.md requirements)
        // Since we don't have a Campaigns collection
        const campaignPerformance = [
            { name: 'New Year Sale', budget: 50000, spend: 48500, orders: 234, revenue: 1230000, roi: 254 },
            { name: 'End of Season', budget: 30000, spend: 28900, orders: 156, revenue: 780000, roi: 270 },
            { name: 'Flash Sale (Wkend)', budget: 15000, spend: 15000, orders: 98, revenue: 350000, roi: 233 },
        ];

        res.json({
            success: true,
            discountMetrics: {
                totalDiscountGiven: summary.totalDiscountGiven,
                discountedOrdersCount: summary.discountedOrdersCount,
                discountedRatio: totalOrders > 0 ? ((summary.discountedOrdersCount / totalOrders) * 100).toFixed(1) : 0,
                revenueImpact: summary.totalRevenueFromDiscounted
            },
            acquisitionChannels,
            campaignPerformance
        });

    } catch (error: any) {
        logger.error('Error fetching marketing analytics:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
