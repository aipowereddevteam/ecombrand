import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/wishlist', isAuthenticated, getWishlist);
router.post('/wishlist', isAuthenticated, addToWishlist);
router.delete('/wishlist/:productId', isAuthenticated, removeFromWishlist);

// Profile
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import multer from 'multer';

// Configure simple storage for multer (assuming controller handles Cloudinary upload)
const upload = multer({ dest: 'tmp/uploads/' });

router.get('/profile', isAuthenticated, getUserProfile);
// Allow single file upload for 'avatar'
router.put('/profile', isAuthenticated, upload.single('avatar'), updateUserProfile);

export default router;
