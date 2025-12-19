const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getAdminProducts,
    getProductDetails,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'tmp/uploads/' });

// Public Routes
router.get('/', getAllProducts);
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

module.exports = router;
