import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        // Fetch unread notifications, sorted by newest first
        const notifications = await Notification.find({ isRead: false })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 to avoid overload
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};
