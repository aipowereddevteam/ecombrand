const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter product title'],
        trim: true,
        maxLength: [100, 'Product title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [5, 'Product price cannot exceed 5 characters'],
        default: 0.0
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Men',
                'Women',
                'Kids',
                'Home',
                'Electronics',
                'Sports'
            ],
            message: 'Please select correct category for product'
        }
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    stock: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);
