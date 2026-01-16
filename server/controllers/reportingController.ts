


import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import ReturnRequest from '../models/ReturnRequest';
import Review from '../models/Review';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Helper function to parse date range from query params
const getDateRange = (req: Request): { startDate: Date; endDate: Date } => {
    const { range, startDate, endDate } = req.query;
    
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
        // Custom range
        start = new Date(startDate as string);
        end = new Date(endDate as string);
    } else {
        // Preset ranges
        switch (range) {
            case '7days':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case '30days':
            default:
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    return { startDate: start, endDate: end };
};

// GET /api/v1/admin/reports/dashboard
export const getExecutiveDashboard = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // Use MongoDB $facet for parallel aggregations
        const dashboardData = await Order.aggregate([
            {
                $facet: {
                    // Total Revenue
                    revenue: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
                        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
                    ],
                    // Previous period revenue (for comparison)
                    previousRevenue: [
                        { 
                            $match: { 
                                createdAt: { 
                                    $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                                    $lt: startDate 
                                },
                                paymentInfo: { $exists: true }
                            } 
                        },
                        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
                    ],
                    // Order stats
                    orders: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                processing: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Processing'] }, 1, 0] } },
                                packing: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Packing'] }, 1, 0] } },
                                shipped: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Shipped'] }, 1, 0] } },
                                delivered: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] } }
                            }
                        }
                    ],
                    // Average Order Value
                    aov: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
                        { 
                            $group: { 
                                _id: null, 
                                avg: { $avg: '$totalPrice' },
                                median: { $median: { input: '$totalPrice', method: 'approximate' } }
                            } 
                        }
                    ],
                    // Daily sales trend for sparkline
                    dailyTrend: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                revenue: { $sum: '$totalPrice' }
                            }
                        },
                        { $sort: { _id: 1 } },
                        { $limit: 30 }
                    ],
                    // Category breakdown
                    categoryBreakdown: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        { $unwind: '$orderItems' },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'orderItems.product',
                                foreignField: '_id',
                                as: 'productInfo'
                            }
                        },
                        { $unwind: '$productInfo' },
                        {
                            $group: {
                                _id: '$productInfo.category',
                                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { revenue: -1 } }
                    ],
                    // Top 5 products
                    topProducts: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        { $unwind: '$orderItems' },
                        {
                            $group: {
                                _id: '$orderItems.product',
                                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                                quantity: { $sum: '$orderItems.quantity' },
                                name: { $first: '$orderItems.name' }
                            }
                        },
                        { $sort: { revenue: -1 } },
                        { $limit: 5 }
                    ]
                }
            }
        ]);

        // Get new customers count
        const newCustomers = await User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const previousNewCustomers = await User.countDocuments({
            createdAt: {
                $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                $lt: startDate
            }
        });

        // Get returns data
        const returns = await ReturnRequest.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const pendingReturns = await ReturnRequest.countDocuments({
            status: { $in: ['Requested', 'QC_Pending', 'Pickup_Scheduled'] }
        });

        // Get reviews data
        const reviews = await Review.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const avgRating = await Review.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        // Get low stock products
        const lowStockProducts = await Product.countDocuments({
            isActive: true,
            $or: [
                { 'stock.S': { $lt: 5 } },
                { 'stock.M': { $lt: 5 } },
                { 'stock.L': { $lt: 5 } },
                { 'stock.XL': { $lt: 5 } },
                { 'stock.XXL': { $lt: 5 } }
            ]
        });

        // Get stuck orders (Processing > 48 hours)
        const stuckOrders = await Order.countDocuments({
            orderStatus: 'Processing',
            createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        });

        // Calculate percentage changes
        const data = dashboardData[0];
        const currentRevenue = data.revenue[0]?.total || 0;
        const prevRevenue = data.previousRevenue[0]?.total || 0;
        const revenueChange = prevRevenue ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : '0';

        const customerChange = previousNewCustomers ? 
            (((newCustomers - previousNewCustomers) / previousNewCustomers) * 100).toFixed(1) : '0';

        res.json({
            success: true,
            dateRange: { startDate, endDate },
            metrics: {
                revenue: {
                    value: currentRevenue,
                    change: revenueChange,
                    trend: Number(revenueChange) >= 0 ? 'up' : 'down',
                    orderCount: data.revenue[0]?.count || 0
                },
                orders: {
                    value: data.orders[0]?.total || 0,
                    breakdown: {
                        processing: data.orders[0]?.processing || 0,
                        packing: data.orders[0]?.packing || 0,
                        shipped: data.orders[0]?.shipped || 0,
                        delivered: data.orders[0]?.delivered || 0
                    }
                },
                customers: {
                    value: newCustomers,
                    change: customerChange,
                    trend: Number(customerChange) >= 0 ? 'up' : 'down'
                },
                aov: {
                    value: Math.round(data.aov[0]?.avg || 0),
                    median: Math.round(data.aov[0]?.median || 0)
                },
                returns: {
                    value: returns,
                    pending: pendingReturns
                },
                reviews: {
                    value: reviews,
                    avgRating: avgRating[0]?.avg ? avgRating[0].avg.toFixed(1) : '0'
                }
            },
            charts: {
                dailyTrend: data.dailyTrend,
                categoryBreakdown: data.categoryBreakdown,
                topProducts: data.topProducts
            },
            alerts: {
                lowStockProducts,
                pendingReturns,
                stuckOrders
            }
        });

    } catch (error: any) {
        logger.error('Error fetching executive dashboard:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/sales
export const getSalesReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        const salesData = await Order.aggregate([
            {
                $facet: {
                    overview: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: '$totalPrice' },
                                totalOrders: { $sum: 1 },
                                avgOrderValue: { $avg: '$totalPrice' },
                                totalTax: { $sum: '$taxPrice' },
                                totalShipping: { $sum: '$shippingPrice' }
                            }
                        }
                    ],
                    dailyTrend: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                revenue: { $sum: '$totalPrice' },
                                orders: { $sum: 1 },
                                avgOrderValue: { $avg: '$totalPrice' }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    paymentMethods: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        {
                            $group: {
                                _id: '$paymentInfo.status',
                                count: { $sum: 1 },
                                revenue: { $sum: '$totalPrice' }
                            }
                        }
                    ]
                }
            }
        ]);

        // Calculate Sales Goals (Monthly Target: 50,00,000)
        const MONTHLY_TARGET = 5000000;
        const currentRevenue = salesData[0].overview[0]?.totalRevenue || 0;
        const progress = (currentRevenue / MONTHLY_TARGET) * 100;
        
        // Calculate remaining days in month
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysLeft = lastDayOfMonth.getDate() - today.getDate();
        
        const salesGoals = {
            monthlyTarget: MONTHLY_TARGET,
            achieved: currentRevenue,
            progress: Math.min(progress, 100).toFixed(1),
            remaining: Math.max(MONTHLY_TARGET - currentRevenue, 0),
            daysLeft,
            dailyRequiredRate: daysLeft > 0 ? Math.max((MONTHLY_TARGET - currentRevenue) / daysLeft, 0) : 0
        };

        res.json({
            success: true,
            dateRange: { startDate, endDate },
            data: salesData[0],
            salesGoals
        });

    } catch (error: any) {
        logger.error('Error fetching sales report:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/hourly-pattern
export const getHourlySalesPattern = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        const hourlyData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentInfo: { $exists: true } } },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1=Sunday, 7=Saturday
                        hour: { $hour: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
        ]);

        // Transform to heatmap format: time slots x days of week
        const heatmapData = Array(4).fill(null).map(() => Array(7).fill(0));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const timeSlots = ['00-06', '06-12', '12-18', '18-24'];

        hourlyData.forEach(item => {
            const dayIndex = item._id.dayOfWeek - 1; // Convert to 0-based
            const hour = item._id.hour;
            const slotIndex = Math.floor(hour / 6); // 0-3 for 4 time slots
            
            heatmapData[slotIndex][dayIndex] += item.revenue;
        });

        res.json({
            success: true,
            data: heatmapData,
            labels: { days, timeSlots }
        });

    } catch (error: any) {
        logger.error('Error fetching hourly pattern:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/geographic
export const getGeographicDistribution = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        const geoData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$shippingInfo.state',
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 } // Top 10 states
        ]);

        res.json({
            success: true,
            data: geoData
        });

    } catch (error: any) {
        logger.error('Error fetching geographic distribution:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// POST /api/v1/admin/reports/export
export const exportReport = async (req: Request, res: Response) => {
    try {
        const { reportType, format, dateRange } = req.body;

        // This is a placeholder - actual implementation would generate CSV/Excel
        // For now, just return success
        res.json({
            success: true,
            message: `Export ${reportType} as ${format} queued`,
            downloadUrl: `/downloads/report_${Date.now()}.${format}`
        });

    } catch (error: any) {
        logger.error('Error exporting report:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
