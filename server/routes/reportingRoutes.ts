import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import {
    getExecutiveDashboard,
    getSalesReport,
    getHourlySalesPattern,
    getGeographicDistribution,
    exportReport
} from '../controllers/reportingController';

const router = express.Router();

// All routes require admin role
router.get('/dashboard', isAuthenticated, authorizeRoles('admin'), getExecutiveDashboard);
router.get('/sales', isAuthenticated, authorizeRoles('admin'), getSalesReport);
router.get('/hourly-pattern', isAuthenticated, authorizeRoles('admin'), getHourlySalesPattern);
router.get('/geographic', isAuthenticated, authorizeRoles('admin'), getGeographicDistribution);
router.post('/export', isAuthenticated, authorizeRoles('admin'), exportReport);

export default router;
