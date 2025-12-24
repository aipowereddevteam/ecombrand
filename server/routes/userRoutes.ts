import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/wishlist', isAuthenticated, getWishlist);
router.post('/wishlist', isAuthenticated, addToWishlist);
router.delete('/wishlist/:productId', isAuthenticated, removeFromWishlist);

// Profile
import { getUserProfile, updateUserProfile } from '../controllers/userController';
router.get('/profile', isAuthenticated, getUserProfile);
router.put('/profile', isAuthenticated, updateUserProfile);

export default router;
