import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    performedBy: string; // User ID or 'SYSTEM'
    targetId?: string; // Order ID, Product ID, User ID
    entityType?: string; // 'Order', 'Product', 'User', etc.
    oldValue?: any;
    newValue?: any;
    correlationId?: string; // For tracing related events
    metadata?: any;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}

const AuditLogSchema: Schema = new Schema({
    action: { type: String, required: true, index: true },
    performedBy: { type: String, required: true }, // Not necessarily ObjectId, could be 'SYSTEM'
    targetId: { type: String, index: true },
    entityType: { type: String, index: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    correlationId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
    ipAddress: { type: String },
    userAgent: { type: String }
}, {
    timestamps: true // adds createdAt, updatedAt
});

// Create compound index for commonly searched patterns
AuditLogSchema.index({ entityType: 1, targetId: 1 });
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
