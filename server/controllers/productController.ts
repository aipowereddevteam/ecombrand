import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import Review from '../models/Review';
import Order from '../models/Order';
import cloudinary from '../utils/cloudinary';
import fs from 'fs';
import redis from '../utils/redis';

// Helper to define file type since Multer types might be tricky with implicit req
interface MulterFile {
    path: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
}

// Helper: Fail-Safe Cache Invalidation
const invalidateProductCache = async (productId: string) => {
    try {
        // 1. Invalidate Single Product Cache
        await redis.del(`product:${productId}`);

        // 2. Invalidate All Product Lists
        const keys = await redis.keys('products:all:*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        console.log(`Cache invalidated for product ${productId} and lists.`);
    } catch (e) {
        // Log error but DO NOT throw. Cache failure should not break the app.
        console.error("Cache Invalidation Failed:", e);
    }
};

// Create Product -- Admin
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { title, description, price, category, stock } = req.body;

        // Handle images
        const imageFiles = req.files as unknown as MulterFile[]; // Assuming multer array, cast needed
        if (!imageFiles || imageFiles.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one image' });
        }

        const imagesLinks = [];

        for (const file of imageFiles) {
            const isVideo = file.mimetype.startsWith('video');
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'ecom_products',
                resource_type: isVideo ? 'video' : 'image'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
                type: isVideo ? 'video' : 'image'
            });

            // Clean up local file after upload
            fs.unlinkSync(file.path);
        }

        let parsedStock = stock;
        if (typeof stock === 'string') {
            try {
                parsedStock = JSON.parse(stock);
            } catch (e) {
                return res.status(400).json({ error: "Invalid stock format" });
            }
        }

        const product = await Product.create({
            title,
            description,
            price,
            category,
            stock: parsedStock,
            images: imagesLinks,
            isActive: true,
            createdBy: (req as any).user.id // user attached by auth middleware
        });

        // Invalidate Cache (Safe)
        await invalidateProductCache(product._id.toString());

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Create Product Error:", error);
        if (req.files) {
            const files = req.files as unknown as MulterFile[];
            files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (e) {
                    console.error("Error deleting file:", file.path);
                }
            });
        }
        const statusCode = (error as any).http_code || 500;
        res.status(statusCode).json({ error: (error as any).message || 'Server Error' });
    }
};

// Get All Products (Public) -- Filter by Active & Search
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query;

        // Cache Key based on query params to handle search/sort permutations
        const cacheKey = `products:all:${JSON.stringify(req.query)}`;
        const cachedProducts = await redis.get(cacheKey);

        if (cachedProducts) {
             return res.status(200).json(JSON.parse(cachedProducts));
        }

        let query: any = { isActive: true };

        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: 'i' // case insensitive
            };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        // Cache for 60 seconds
        await redis.set(cacheKey, JSON.stringify({ success: true, products }), 'EX', 60);

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get All Products (Admin) -- Include Inactive
export const getAdminProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Product Details
export const getProductDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `product:${id}`;

        // 1. Check Redis Cache
        const cachedProduct = await redis.get(cacheKey);

        if (cachedProduct) {
            // Return cached data
            return res.status(200).json(JSON.parse(cachedProduct));
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Aggregate ratings distribution
        const stats = await Review.aggregate([
            { $match: { product: product._id } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Rating Stats for", req.params.id, ":", stats);

        const distribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        stats.forEach((s: any) => {
            if (s._id >= 1 && s._id <= 5) {
                (distribution as any)[s._id] = s.count;
            }
        });

        const responseData = {
            success: true,
            product,
            distribution
        };

        // 2. Set Cache (60 seconds)
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);

        res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Related Products
export const getRelatedProducts = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cacheKey = `product:related:${req.params.id}`;
        const cachedRelated = await redis.get(cacheKey);

        if (cachedRelated) {
            return res.status(200).json(JSON.parse(cachedRelated));
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(8);

        await redis.set(cacheKey, JSON.stringify({ success: true, products: relatedProducts }), 'EX', 60);

        res.status(200).json({
            success: true,
            products: relatedProducts
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update Product -- Admin
export const updateProduct = async (req: Request, res: Response) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update basic fields
        if (req.body.title) product.title = req.body.title;
        if (req.body.description) product.description = req.body.description;
        if (req.body.price) product.price = req.body.price;
        if (req.body.category) product.category = req.body.category;

        if (req.body.stock) {
            if (typeof req.body.stock === 'string') {
                try {
                    product.stock = JSON.parse(req.body.stock);
                } catch (e) {
                    // ignore or error
                }
            } else {
                product.stock = req.body.stock; // Need to ensure type match or cast
            }
        }

        if (req.body.isActive !== undefined) {
            product.isActive = req.body.isActive;
        }

        // Handle Image Deletion
        if (req.body.deleteImagePublicIds) {
            let deleteIds: string[] = [];
            if (typeof req.body.deleteImagePublicIds === 'string') {
                try {
                    deleteIds = JSON.parse(req.body.deleteImagePublicIds);
                } catch (e) {
                    console.error("Error parsing deleteImagePublicIds", e);
                }
            } else {
                deleteIds = req.body.deleteImagePublicIds;
            }

            if (Array.isArray(deleteIds) && deleteIds.length > 0) {
                product.images = product.images.filter(
                    img => !deleteIds.includes(img.public_id)
                );
            }
        }

        // Handle Image Append
        if (req.files && (req.files as unknown as MulterFile[]).length > 0) {
            const imageFiles = req.files as unknown as MulterFile[];
            for (const file of imageFiles) {
                const isVideo = file.mimetype.startsWith('video');
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'ecom_products',
                    resource_type: isVideo ? 'video' : 'image'
                });

                product.images.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                    type: isVideo ? 'video' : 'image'
                });

                fs.unlinkSync(file.path);
            }
        }

        // Ensure createdBy exists to satisfy validation (for compatibility with legacy data)
        if (!product.createdBy && (req as any).user) {
            // Try flexible access to id from user payload
            product.createdBy = (req as any).user._id || (req as any).user.id;
        }

        await product.save();

        // Invalidate Cache (Safe)
        await invalidateProductCache(req.params.id);

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Update Product Error:", error);
        if (req.files) {
            const files = req.files as unknown as MulterFile[];
            files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (e) {
                    console.error("Error deleting file:", file.path);
                }
            });
        }
        const statusCode = (error as any).http_code || 500;
        res.status(statusCode).json({ error: (error as any).message || 'Server Error' });
    }
};

// Delete Product (Soft Delete) -- Admin
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Invalidate Cache (Safe)
        await invalidateProductCache(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deactivated successfully'
        });

    } catch (error: any) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: error.message || 'Server Error' });
    }
};

// Check Stock Availability -- Public
export const checkStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { size } = req.query;

        if (!size || typeof size !== 'string') {
            return res.status(400).json({ error: 'Size parameter is required' });
        }

        const product = await Product.findOne({ _id: id, isActive: true });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or unavailable' });
        }

        // Check stock for specific size
        // Casting as any because stock uses explicit keys in interface but we are accessing dynamically
        const stockCount = (product.stock as any)[size];

        if (stockCount === undefined) {
            return res.status(400).json({ error: `Invalid size: ${size}` });
        }

        if (stockCount > 0) {
            res.status(200).json({ success: true, inStock: true, stock: stockCount });
        } else {
            // Return 409 Conflict if out of stock specifically
            res.status(409).json({ success: false, inStock: false, error: 'Out of Stock' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Create New Review or Update the review
// Create New Review or Update the review
export const createReview = async (req: Request, res: Response) => {
    try {
        const { rating, comment, productId, orderId } = req.body;
        const userId = (req as any).user.id;

        // 1. Validate Order & Verified Purchase
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to review this order' });
        }

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ error: 'You can only review delivered products' });
        }

        const isProductInOrder = order.orderItems.some(
            (item) => item.product.toString() === productId
        );

        if (!isProductInOrder) {
            return res.status(400).json({ error: 'Product not found in this order' });
        }

        // Handle media uploads
        const mediaLinks: { public_id: string; url: string; type: string }[] = [];
        if (req.files && (req.files as unknown as MulterFile[]).length > 0) {
            const files = req.files as unknown as MulterFile[];
            for (const file of files) {
                const isVideo = file.mimetype.startsWith('video');
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'ecom_reviews',
                    resource_type: isVideo ? 'video' : 'image'
                });

                mediaLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                    type: isVideo ? 'video' : 'image'
                });

                fs.unlinkSync(file.path);
            }
        }

        // 2. Check for Existing Review for this Order
        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
            order: orderId
        });

        if (existingReview) {
            // Update existing review (upsert logic for same order)
            existingReview.rating = Number(rating);
            existingReview.comment = comment;

            // Handle media deletion
            if (req.body.deletedMediaIds) {
                let deletedIds = req.body.deletedMediaIds;
                if (typeof deletedIds === 'string') {
                    try {
                        deletedIds = JSON.parse(deletedIds);
                    } catch (e) {
                        deletedIds = [];
                    }
                }

                if (Array.isArray(deletedIds) && deletedIds.length > 0) {
                    for (const id of deletedIds) {
                        try {
                            await cloudinary.uploader.destroy(id);
                        } catch (err) {
                            // console.error('Cloudinary destroy error:', err);
                        }
                    }
                    if (existingReview.media) {
                        existingReview.media = existingReview.media.filter(
                            (m) => !deletedIds.includes(m.public_id)
                        );
                    }
                }
            }

            if (mediaLinks.length > 0) {
                if (!existingReview.media) existingReview.media = [];
                existingReview.media.push(...mediaLinks);
            }

            await existingReview.save();
        } else {
            // Create new review
            await Review.create({
                user: userId,
                product: productId,
                order: orderId,
                rating: Number(rating),
                comment,
                media: mediaLinks,
                isVerifiedPurchase: true
            });
        }

        // 3. Aggregate Ratings - HANDLED BY REVIEW MODEL HOOK

        res.status(200).json({
            success: true,
        });

    } catch (error: any) { // Type as any for error code check
        console.error("Review Error:", error);
        // Handle duplicate key error manually if race condition happens despite check
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You have already reviewed this product for this order' });
        }
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Product Reviews
export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Product ID used in route /products/reviews/:id
        const { sort, page, limit } = req.query;

        let sortOption: any = { createdAt: -1 };
        if (sort === 'rating') {
            sortOption = { rating: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 1000; // Default to all (safe limit) if not specified for backward compatibility
        const skip = (pageNum - 1) * limitNum;

        const totalReviews = await Review.countDocuments({ product: id });
        const reviews = await Review.find({ product: id })
            .populate('user', 'name avatar') // select name and avatar
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            reviews,
            currentPage: pageNum,
            totalPages: Math.ceil(totalReviews / limitNum),
            totalReviews
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Delete Review
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.id;
        const userId = (req as any).user.id; // from auth middleware

        const review = await Review.findOneAndDelete({
            _id: reviewId,
            user: userId
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found or not authorized' });
        }

        // Hook 'findOneAndDelete' will trigger automatically to update product stats

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
