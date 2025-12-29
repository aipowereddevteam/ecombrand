
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Assume req.user is populated by previous auth middleware (e.g. passport or protect)
        const user = req.user as IUser;

        if (!user) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        // Admins have all permissions implicitly
        if (user.role === 'admin') {
            return next();
        }

        if (user.permissions && user.permissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    };
};
