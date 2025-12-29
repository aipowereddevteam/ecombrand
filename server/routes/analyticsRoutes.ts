import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import { checkPermission } from '../middleware/checkPermission';
import { getAnalyticsSummary, getSalesTrend, getTopProducts } from '../controllers/analyticsController';

const router = express.Router();

// All routes here are protected
// Admins have full access. Accountants can view analytics.
router.use(isAuthenticated);
router.use(authorizeRoles('admin', 'accountant'));

// Route: /api/admin/analytics/summary
// Permission Required: 'view_analytics'
router.get('/summary', checkPermission('view_analytics'), getAnalyticsSummary);

// Route: /api/admin/analytics/sales-trend
// Permission Required: 'view_analytics'
router.get('/sales-trend', checkPermission('view_analytics'), getSalesTrend);

// Route: /api/admin/analytics/top-products
// Permission Required: 'view_analytics' (or 'manage_inventory' if more appropriate)
router.get('/top-products', checkPermission('view_analytics'), getTopProducts);

export default router;
