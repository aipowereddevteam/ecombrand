import mongoose, { Document, Model, Schema } from 'mongoose';
import { IOrder } from './Order';
import { IUser } from './User';

export interface IReturnItem {
    orderItemId: string; // Corresponds to the sub-document ID in Order.orderItems
    product: mongoose.Types.ObjectId;
    quantity: number;
    reason: string;
    condition?: string;
    images?: string[];
}

export interface IReturnRequest extends Document {
    order: mongoose.Types.ObjectId | IOrder;
    user: mongoose.Types.ObjectId | IUser;
    items: IReturnItem[];
    status: 'Requested' | 'Pickup_Scheduled' | 'QC_Pending' | 'QC_Passed' | 'QC_Failed' | 'Refund_Processing' | 'Refunded' | 'Refund_Failed';
    refundAmount: number;
    qcNotes?: string;
    qcBy?: mongoose.Types.ObjectId | IUser;
    rejectionReason?: string;
    auditLog: {
        status: string;
        timestamp: Date;
        updatedBy?: mongoose.Types.ObjectId | IUser;
        note?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const returnRequestSchema = new mongoose.Schema<IReturnRequest>({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        orderItemId: { type: String, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        reason: { type: String, required: true },
        condition: { type: String },
        images: [{ type: String }]
    }],
    status: {
        type: String,
        enum: ['Requested', 'Pickup_Scheduled', 'QC_Pending', 'QC_Passed', 'QC_Failed', 'Refund_Processing', 'Refunded', 'Refund_Failed'],
        default: 'Requested'
    },
    refundAmount: {
        type: Number,
        required: true
    },
    qcNotes: { type: String },
    qcBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    auditLog: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String }
    }]
}, { timestamps: true });

const ReturnRequest: Model<IReturnRequest> = mongoose.model<IReturnRequest>('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
