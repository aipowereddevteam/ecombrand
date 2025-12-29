import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email: string;
    avatar?: string;
    googleId?: string;
    phone?: string;
    role: 'user' | 'admin' | 'account_manager' | 'warehouse' | 'accountant';
    gender?: string;
    dob?: Date;
    location?: string;
    alternateMobile?: string;
    hintName?: string;
    isPhoneVerified: boolean;
    permissions?: string[];
    assignedModules?: string[];
    wishlist: any[]; // Using any[] to avoid circular dependency types for now, or use mongoose.Types.ObjectId[]
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        // Email might not be present if phone based or other auth methods are added later without email, 
        // but requirements say email (unique). Assuming required for Google Auth.
        required: true
    },
    avatar: {
        type: String
    },
    googleId: {
        type: String
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    gender: { type: String },
    dob: { type: Date },
    location: { type: String },
    alternateMobile: { type: String },
    hintName: { type: String },
    role: {
        type: String,
        enum: ['user', 'admin', 'account_manager', 'warehouse', 'accountant'],
        default: 'user'
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    permissions: [{
        type: String
    }],
    assignedModules: {
        type: [String],
        default: []
    },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
