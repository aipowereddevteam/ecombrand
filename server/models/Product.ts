import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';

export interface IProduct extends Document {
    title: string;
    description: string;
    price: number;
    category: string;
    images: {
        public_id: string;
        url: string;
        type?: string;
    }[];
    stock: {
        S: number;
        M: number;
        L: number;
        XL: number;
        XXL: number;
    } | undefined; // Using undefined check if not strictly required, but Schema has defaults so it will be there.
    isActive: boolean;
    ratings: number;
    numOfReviews: number;

    createdAt: Date;
    createdBy: mongoose.Types.ObjectId | IUser;
}

const productSchema = new mongoose.Schema<IProduct>({
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
                'GenZ'
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
            },
            type: {
                type: String,
                default: 'image' // 'image' or 'video'
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
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Pre-delete hook to cleanup Cloudinary resources
productSchema.pre('findOneAndDelete', async function () {
    try {
        const product = await this.model.findOne(this.getQuery());
        if (product && product.images && product.images.length > 0) {
            // Dynamically import to avoid circular dependency
            const { deleteFromCloudinary } = await import('../utils/cloudinary');
            console.log(`Auto-cleanup: Deleting ${product.images.length} Cloudinary resources for product`);

            for (const image of product.images) {
                await deleteFromCloudinary(image.public_id, 'auto');
            }
        }
    } catch (error) {
        console.error('Product pre-delete hook error:', error);
        // Don't block deletion even if Cloudinary cleanup fails
    }
});

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
export default Product;
