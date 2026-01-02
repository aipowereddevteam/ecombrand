
import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { ALL_MODULES } from '../utils/adminConstants';
import { saveAuditLog } from '../utils/auditLogger';

// Get all users (with optional search)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const keyword = typeof req.query.keyword === 'string'
            ? {
                email: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const users = await User.find({ ...keyword }).select('-password');
        res.json(users);
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent changing own role (basic safety, though super admin might need to)
        // const currentUser = (req as any).user;
        // if (user._id.toString() === currentUser._id.toString()) {
        //     return res.status(400).json({ error: 'Cannot change your own role' });
        // }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        await saveAuditLog({
            action: 'ROLE_CHANGED',
            performedBy: (req as any).user ? (req as any).user.id : 'ADMIN',
            targetId: user._id.toString(),
            entityType: 'User',
            oldValue: { role: oldRole },
            newValue: { role: role },
            metadata: { endpoint: 'updateUserRole' }
        });

        res.json({ message: 'User role updated', user });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get User Modules


export const getUserModules = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('assignedModules');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const assigned = user.assignedModules || [];
        // Available are all modules that are NOT in assigned
        const available = ALL_MODULES.filter(m => !assigned.includes(m));

        res.json({
            available,
            assigned
        });
    } catch (error) {
        console.error("Error getting user modules:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update User Modules
export const updateUserModules = async (req: Request, res: Response) => {
    try {
        const { modules } = req.body; // Expecting array of strings

        if (!Array.isArray(modules)) {
            return res.status(400).json({ error: 'Invalid modules format' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldModules = user.assignedModules;
        user.assignedModules = modules;
        await user.save();

        await saveAuditLog({
            action: 'MODULES_UPDATED',
            performedBy: (req as any).user ? (req as any).user.id : 'ADMIN',
            targetId: user._id.toString(),
            entityType: 'User',
            oldValue: { modules: oldModules },
            newValue: { modules: modules },
            metadata: { endpoint: 'updateUserModules' }
        });

        res.json({
            message: 'User modules updated',
            assignedModules: user.assignedModules
        });
    } catch (error) {
        console.error("Error updating user modules:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { page, limit, correlationId, action, entityType, performedBy, targetId } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 50;
        const skip = (pageNum - 1) * limitNum;

        const query: any = {};

        if (correlationId) query.correlationId = correlationId;
        if (action) query.action = { $regex: action, $options: 'i' };
        if (entityType) query.entityType = entityType;
        if (targetId) query.targetId = targetId;
        if (performedBy) query.performedBy = { $regex: performedBy, $options: 'i' };

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            logs,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error("Error getting audit logs:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
