import { Request, Response } from 'express';
import Order from '../models/Order';
import ReturnRequest from '../models/ReturnRequest';
import Review from '../models/Review';
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

// GET /api/v1/admin/reports/financial
export const getFinancialReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // 1. Revenue & Tax Analysis
        const financialStats = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalTax: { $sum: "$taxPrice" },
                    totalShipping: { $sum: "$shippingPrice" },
                    totalItemsPrice: { $sum: "$itemsPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = financialStats[0] || { totalRevenue: 0, totalTax: 0, totalShipping: 0, totalItemsPrice: 0, count: 0 };

        // COGS Estimation (Assuming 60% of item price is cost for demo purposes as we lack purchase price field)
        const estimatedCOGS = stats.totalItemsPrice * 0.6;
        const grossProfit = stats.totalRevenue - estimatedCOGS - stats.totalTax - stats.totalShipping;

        // 2. Payment Gateway Analysis
        // Logic: specific implementation logic (e.g. Razorpay IDs usually start with pay_)
        const paymentStats = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $project: {
                    method: {
                        $cond: [
                            { $regexMatch: { input: "$paymentInfo.id", regex: /^pay_/ } },
                            "Razorpay",
                            "COD" // Fallback assumption
                        ]
                    },
                    totalPrice: 1
                }
            },
            {
                $group: {
                    _id: "$method",
                    count: { $sum: 1 },
                    volume: { $sum: "$totalPrice" }
                }
            }
        ]);

        res.json({
            success: true,
            pnl: {
                revenue: stats.totalRevenue,
                cogs: estimatedCOGS,
                grossProfit: grossProfit,
                operatingExpenses: stats.totalShipping + (stats.totalRevenue * 0.05), // Mocking marketing/ops cost
                netProfit: grossProfit - (stats.totalRevenue * 0.05), // Simple Net Profit calc
                taxCollected: stats.totalTax
            },
            paymentMethods: paymentStats
        });

    } catch (error: any) {
        logger.error('Error fetching financial report:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/returns
export const getReturnAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // 1. Return Status Overview
        const returnStats = await ReturnRequest.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalRefundAmount: { $sum: "$refundAmount" }
                }
            }
        ]);

        // 2. Return Reasons Breakdown
        const reasonStats = await ReturnRequest.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.reason",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            statusBreakdown: returnStats,
            reasonBreakdown: reasonStats,
            totalReturns: returnStats.reduce((acc, curr) => acc + curr.count, 0),
            totalRefunded: returnStats.reduce((acc, curr) => acc + curr.totalRefundAmount, 0)
        });

    } catch (error: any) {
        logger.error('Error fetching return analytics:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/reviews
export const getReviewAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // 1. Rating Distribution
        const ratingStats = await Review.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } } // 5 stars first
        ]);

        // 2. Recent Reviews with Sentiment (Mocked sentiment)
        const recentReviews = await Review.find({ createdAt: { $gte: startDate, $lte: endDate } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name')
            .populate('product', 'title');
        
        // Calculate average
        const totalReviews = ratingStats.reduce((acc, curr) => acc + curr.count, 0);
        const weightedSum = ratingStats.reduce((acc, curr) => acc + (curr._id * curr.count), 0);
        const avgRating = totalReviews > 0 ? (weightedSum / totalReviews).toFixed(1) : 0;

        res.json({
            success: true,
            ratingDistribution: ratingStats,
            avgRating,
            totalReviews,
            recentReviews
        });

    } catch (error: any) {
        logger.error('Error fetching review analytics:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
