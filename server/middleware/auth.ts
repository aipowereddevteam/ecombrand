import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    id: string;
    role: string;
    isPhoneVerified: boolean;
    name: string;
    avatar: string;
    iat: number;
    exp: number;
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        (req as any).user = decoded; // Using any for req here to allow attaching user
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const ensurePhoneVerified = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.isPhoneVerified) {
        return res.status(403).json({ error: 'PHONE_REQUIRED' });
    }
    next();
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!roles.includes(user.role)) {
            return res.status(403).json({
                error: `Role (${user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};
