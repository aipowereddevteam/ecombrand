const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Create Product -- Admin
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, category, stock } = req.body;

        // Handle images
        const imageFiles = req.files;
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
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Create Product Error:", error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get All Products (Public) -- Filter by Active
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get All Products (Admin) -- Include Inactive
exports.getAdminProducts = async (req, res) => {
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
exports.getProductDetails = async (req, res) => {
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
exports.updateProduct = async (req, res) => {
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
                product.stock = req.body.stock;
            }
        }

        if (req.body.isActive !== undefined) {
            product.isActive = req.body.isActive;
        }

        // Handle Image Deletion
        if (req.body.deleteImagePublicIds) {
            let deleteIds = [];
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
        if (req.files && req.files.length > 0) {
            const imageFiles = req.files;
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
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: 'Server Error' });
    }
};

// Delete Product (Soft Delete) -- Admin
exports.deleteProduct = async (req, res) => {
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
