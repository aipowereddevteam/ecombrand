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
    }[];
    stock: {
        S: number;
        M: number;
        L: number;
        XL: number;
        XXL: number;
    } | undefined; // Using undefined check if not strictly required, but Schema has defaults so it will be there.
    isActive: boolean;
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
export default Product;
