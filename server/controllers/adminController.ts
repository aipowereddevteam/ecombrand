
import { Request, Response } from 'express';
import User from '../models/User';
import { ALL_MODULES } from '../utils/adminConstants';

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

        user.role = role;
        await user.save();

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

        user.assignedModules = modules;
        await user.save();

        res.json({
            message: 'User modules updated',
            assignedModules: user.assignedModules
        });
    } catch (error) {
        console.error("Error updating user modules:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
