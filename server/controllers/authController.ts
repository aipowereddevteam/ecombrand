import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const googleCallback = (req: Request, res: Response) => {
    try {
        const user = req.user as IUser; // Extends Request with user from Passport
        console.log("DEBUG: Google Callback User:", JSON.stringify(user, null, 2));

        const payload = {
            id: user._id,
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
            name: user.name,
            avatar: user.avatar
        };
        console.log("DEBUG: Token Payload:", JSON.stringify(payload, null, 2));

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        // Redirect to frontend with token
        // Assuming frontend is running on localhost:3000
        res.redirect(`http://localhost:3000/login?token=${token}`);
    } catch (error) {
        console.error("Google Callback Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const verifyPhone = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const currentUser = req.user as IUser;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if phone already used by another user
        const existingUser = await User.findOne({ phone });
        if (existingUser && existingUser._id.toString() !== currentUser._id.toString()) {
            return res.status(400).json({ error: 'Phone number already in use' });
        }

        const user = await User.findById(currentUser._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.phone = phone;
        user.isPhoneVerified = true;
        await user.save();

        // Regenerate token with updated isPhoneVerified status
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                name: user.name,
                avatar: user.avatar
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Phone verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Verify Phone Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
