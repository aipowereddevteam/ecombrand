import AuditLog from '../models/AuditLog';
import { v4 as uuidv4 } from 'uuid';

interface AuditLogOptions {
    action: string;
    performedBy: string;
    targetId?: string;
    entityType?: string;
    oldValue?: any;
    newValue?: any;
    correlationId?: string;
    metadata?: any; // Additional info like Reason, Razorpay ID, etc.
    ipAddress?: string;
    userAgent?: string;
}

export const saveAuditLog = async (options: AuditLogOptions) => {
    try {
        await AuditLog.create({
            ...options,
            correlationId: options.correlationId || uuidv4(),
            timestamp: new Date()
        });
        // console.log(`[AuditLog] ${options.action} - ${options.entityType}:${options.targetId}`);
    } catch (error) {
        // Fallback: don't crash the app if logging fails, but log to file/console
        console.error("FAILED TO SAVE AUDIT LOG:", error);
        console.error("Log Data was:", JSON.stringify(options));
    }
};

// Helper middleware for Express requests
export const logAction = (action: string) => {
    return async (req: any, res: any, next: any) => {
        // This is a placeholder for a generic middleware.
        // Complex locgic usually happens inside controllers.
        next();
    };
};
