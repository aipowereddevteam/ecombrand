import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import { 
    getExecutiveDashboard, 
    getSalesReport, 
    getHourlySalesPattern, 
    getGeographicDistribution,
    exportReport
} from '../controllers/reportingController';
import { 
    getProductPerformance, 
    getInventoryAnalytics 
} from '../controllers/productAnalyticsController';
import { 
    getCustomerAnalytics, 
    getMarketingAnalytics 
} from '../controllers/customerAnalyticsController';
import {
    getFinancialReport,
    getReturnAnalytics,
    getReviewAnalytics
} from '../controllers/financialAnalyticsController';

const router = express.Router();

router.get('/dashboard', isAuthenticated, authorizeRoles('admin'), getExecutiveDashboard);
router.get('/sales', isAuthenticated, authorizeRoles('admin'), getSalesReport);
router.get('/hourly-pattern', isAuthenticated, authorizeRoles('admin'), getHourlySalesPattern);
router.get('/geographic', isAuthenticated, authorizeRoles('admin'), getGeographicDistribution);

// Phase 2 Routes
router.get('/products', isAuthenticated, authorizeRoles('admin'), getProductPerformance);
router.get('/inventory', isAuthenticated, authorizeRoles('admin'), getInventoryAnalytics);

// Phase 3 Routes
router.get('/customers', isAuthenticated, authorizeRoles('admin'), getCustomerAnalytics);
router.get('/marketing', isAuthenticated, authorizeRoles('admin'), getMarketingAnalytics);

// Phase 4 Routes
router.get('/financial', isAuthenticated, authorizeRoles('admin'), getFinancialReport);
router.get('/returns', isAuthenticated, authorizeRoles('admin'), getReturnAnalytics);
router.get('/reviews', isAuthenticated, authorizeRoles('admin'), getReviewAnalytics);

router.post('/export', isAuthenticated, authorizeRoles('admin'), exportReport);

export default router;
