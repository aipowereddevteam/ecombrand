import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import logger from '../utils/logger';
import mongoose from 'mongoose';

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

// GET /api/v1/admin/reports/products
export const getProductPerformance = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = getDateRange(req);

        // Parallel Aggregation: Current Period vs Previous Period (for trends)
        const productStats = await Order.aggregate([
            {
                $facet: {
                    currentPeriod: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        { $unwind: '$orderItems' },
                        {
                            $group: {
                                _id: '$orderItems.product',
                                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                                quantity: { $sum: '$orderItems.quantity' },
                                orders: { $sum: 1 },
                                name: { $first: '$orderItems.name' }
                            }
                        }
                    ],
                    previousPeriod: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
                                    $lt: startDate
                                }
                            }
                        },
                        { $unwind: '$orderItems' },
                        {
                            $group: {
                                _id: '$orderItems.product',
                                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                            }
                        }
                    ]
                }
            }
        ]);

        // Merge Current & Previous Data to calculate trend
        const currentParams = productStats[0].currentPeriod;
        const prevParams = productStats[0].previousPeriod;

        // Fetch current stock for these products
        const productIds = currentParams.map((p: any) => p._id);
        const products = await Product.find({ _id: { $in: productIds } }).select('stock category ratings price');

        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const prevRevenueMap = new Map(prevParams.map((p: any) => [p._id.toString(), p.revenue]));

        const enrichedData = currentParams.map((item: any) => {
            const product = productMap.get(item._id.toString());
            const prevRevenue = prevRevenueMap.get(item._id.toString()) || 0;

            // Calculate total stock
            let totalStock = 0;
            if (product && product.stock) {
                totalStock = (product.stock.S || 0) + (product.stock.M || 0) + (product.stock.L || 0) + (product.stock.XL || 0) + (product.stock.XXL || 0);
            }

            // Calculate trend %
            let trend = 0;
            const currentRev = parseFloat(item.revenue);
            const prevRev = parseFloat(prevRevenue as any); // Safe cast

            if (prevRev > 0) {
                trend = ((currentRev - prevRev) / prevRev) * 100;
            } else if (currentRev > 0) {
                trend = 100; // New sales
            }

            return {
                _id: item._id,
                name: item.name,
                category: product ? product.category : 'Uncategorized',
                revenue: item.revenue,
                orders: item.orders,
                quantity: item.quantity,
                stock: totalStock,
                rating: product ? product.ratings : 0,
                price: product ? product.price : 0,
                trend: trend.toFixed(1)
            };
        });

        // Sort by revenue descending
        enrichedData.sort((a: any, b: any) => b.revenue - a.revenue);

        res.json({
            success: true,
            dateRange: { startDate, endDate },
            data: enrichedData
        });

    } catch (error: any) {
        logger.error('Error fetching product performance:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/v1/admin/reports/inventory
export const getInventoryAnalytics = async (req: Request, res: Response) => {
    try {
        // 1. Stock Overview
        const stockData = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $project: {
                    name: 1,
                    price: 1,
                    category: 1,
                    totalStock: { $add: ["$stock.S", "$stock.M", "$stock.L", "$stock.XL", "$stock.XXL"] },
                    stockValue: {
                        $multiply: [
                            "$price",
                            { $add: ["$stock.S", "$stock.M", "$stock.L", "$stock.XL", "$stock.XXL"] }
                        ]
                    },
                    stock: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStockItems: { $sum: "$totalStock" },
                    totalStockValue: { $sum: "$stockValue" },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lt: ["$totalStock", 10] }, 1, 0]
                        }
                    },
                    products: { $push: "$$ROOT" } // Keep all products for further analysis if needed
                }
            }
        ]);

        const summary = stockData[0] || { totalProducts: 0, totalStockItems: 0, totalStockValue: 0, lowStockCount: 0 };

        // 2. Dead Stock Analysis (No sales in last 60 days)
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

        // Find products sold in last 60 days
        const soldProductIdsRaw = await Order.distinct('orderItems.product', {
            createdAt: { $gte: sixtyDaysAgo }
        });
        const soldProductIds = soldProductIdsRaw.map((id: any) =>
            id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
        );

        // Dead stock = Active products NOT in soldProductIds
        const deadStock = await Product.find({
            _id: { $nin: soldProductIds as mongoose.Types.ObjectId[] },
            isActive: true
        }).select('name price category stock images');

        // Calculate Dead Stock Value
        let deadStockValue = 0;
        const deadStockItems = deadStock.map((p: any) => { // Cast p to any to avoid Document type issues
            // Safety check for stock
            const stockObj = p.stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
            const stockCount = (stockObj.S || 0) + (stockObj.M || 0) + (stockObj.L || 0) + (stockObj.XL || 0) + (stockObj.XXL || 0);

            const value = stockCount * (p.price || 0);
            deadStockValue += value;
            return {
                _id: p._id,
                name: p.name,
                stock: stockCount,
                value,
                lastSale: 'No recent sales',
                category: p.category,
                image: p.images && p.images[0] ? p.images[0].url : ''
            };
        });

        // 3. Low Stock Alerts (Detailed)
        // Reusing the projected products from aggregation or fetching again
        // Let's fetch specifically for clean list
        const lowStockList = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $project: {
                    name: 1,
                    category: 1,
                    stock: 1,
                    totalStock: { $add: ["$stock.S", "$stock.M", "$stock.L", "$stock.XL", "$stock.XXL"] },
                    image: { $arrayElemAt: ["$images.url", 0] }
                }
            },
            { $match: { totalStock: { $lt: 20 } } }, // Threshold < 20
            { $sort: { totalStock: 1 } },
            { $limit: 20 }
        ]);

        res.json({
            success: true,
            summary: {
                totalProducts: summary.totalProducts,
                totalStockUnits: summary.totalStockItems,
                totalStockValue: summary.totalStockValue,
                lowStockCount: summary.lowStockCount,
                deadStockCount: deadStock.length,
                deadStockValue
            },
            deadStock: deadStockItems.slice(0, 10), // Top 10 dead stock
            lowStock: lowStockList,
            categoryStock: await Product.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: { $add: ["$stock.S", "$stock.M", "$stock.L", "$stock.XL", "$stock.XXL"] } },
                        value: { $sum: { $multiply: ["$price", { $add: ["$stock.S", "$stock.M", "$stock.L", "$stock.XL", "$stock.XXL"] }] } }
                    }
                }
            ])
        });

    } catch (error: any) {
        logger.error('Error fetching inventory analytics:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
