import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITransaction extends Document {
    type: 'Credit' | 'Debit' | 'Refund';
    amount: number;
    currency: string;
    status: 'Success' | 'Pending' | 'Failed';
    referenceId: mongoose.Types.ObjectId; // Generic reference to Order or ReturnRequest
    referenceModel: 'Order' | 'ReturnRequest';
    description: string;
    performedBy?: mongoose.Types.ObjectId | IUser; // System or Admin
    gatewayTransactionId?: string; // e.g. Razorpay refund ID
    createdAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    type: {
        type: String,
        enum: ['Credit', 'Debit', 'Refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['Success', 'Pending', 'Failed'],
        default: 'Pending'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        required: true,
        enum: ['Order', 'ReturnRequest']
    },
    description: {
        type: String
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gatewayTransactionId: {
        type: String
    }
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
