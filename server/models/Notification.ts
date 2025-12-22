import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
