import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import cloudinary from '../utils/cloudinary';
import fs from 'fs';

// Helper to define file type since Multer types might be tricky with implicit req
interface MulterFile {
    path: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
}

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
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'ecom_products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
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

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Create Product Error:", error);
        if (req.files) {
            const files = req.files as unknown as MulterFile[];
            files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get All Products (Public) -- Filter by Active & Search
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query;
        
        let query: any = { isActive: true };

        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: 'i' // case insensitive
            };
        }

        const products = await Product.find(query);
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
        const products = await Product.find();
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
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            product
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
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'ecom_products'
                });

                product.images.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });

                fs.unlinkSync(file.path);
            }
        }

        await product.save();

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Update Product Error:", error);
        if (req.files) {
             const files = req.files as unknown as MulterFile[];
            files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: 'Server Error' });
    }
};

// Delete Product (Soft Delete) -- Admin
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Soft Delete
        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product deactivated successfully'
        });

    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
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

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
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
