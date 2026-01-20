import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';

// Add to Wishlist
export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body;
        const userId = (req as any).user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if already in wishlist
        const exists = user.wishlist.some((id: any) => id.toString() === productId);
        if (exists) {
            return res.status(400).json({ error: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error("Add Wishlist Error", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Remove from Wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const userId = (req as any).user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
        await user.save();

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error("Remove Wishlist Error", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Wishlist
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId).populate('wishlist');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error("Get Wishlist Error", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get Full Profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update Profile
import cloudinary, { deleteFromCloudinary, extractPublicIdFromUrl } from '../utils/cloudinary';
import fs from 'fs';

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, email, phone, gender, dob, location, alternateMobile, hintName } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;
        if (location) user.location = location;
        if (alternateMobile) user.alternateMobile = alternateMobile;
        if (hintName) user.hintName = hintName;

        // Handle Avatar Upload
        if (req.file) {
            try {
                // Delete old avatar from Cloudinary if exists
                if (user.avatar) {
                    const publicId = extractPublicIdFromUrl(user.avatar);
                    if (publicId) {
                        console.log(`Deleting old avatar from Cloudinary: ${publicId}`);
                        await deleteFromCloudinary(publicId, 'image');
                    }
                }

                // Upload new avatar
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'avatars',
                    width: 150,
                    crop: 'scale',
                });
                user.avatar = result.secure_url;

                // Clean up local file
                fs.unlinkSync(req.file.path);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error", uploadError);
                // Continue saving other details even if image fails
            }
        }

        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Update Profile Error", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
