import express from 'express';
import {
    createProduct,
    getAllProducts,
    getAdminProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    checkStock
} from '../controllers/productController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'tmp/uploads/' });

// Public Routes
router.get('/', getAllProducts);
router.get('/:id/check-stock', checkStock);
router.get('/:id', getProductDetails);

// Admin Routes
router.post(
    '/admin/new',
    isAuthenticated,
    authorizeRoles('admin'),
    upload.array('images', 10),
    createProduct
);

router.get(
    '/admin/all',
    isAuthenticated,
    authorizeRoles('admin'),
    getAdminProducts
);

router.put(
    '/admin/:id',
    isAuthenticated,
    authorizeRoles('admin'),
    upload.array('images', 10),
    updateProduct
);

router.delete(
    '/admin/:id',
    isAuthenticated,
    authorizeRoles('admin'),
    deleteProduct
);

export default router;
