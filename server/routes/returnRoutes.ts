import express from 'express';
import { requestReturn, updateQCStatus, getReturnRequests } from '../controllers/returnController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
// Import checkPermission if available, or just use role for now. 
// User prompt mentioned "QC_Module". Assuming we have a checkPermission or we can use authorizeRoles with specific roles.
// Let's use authorizeRoles for 'warehouse' 'admin' for QC now.

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Returns
 *   description: Return and Refund Management
 */

/**
 * @swagger
 * /returns/request:
 *   post:
 *     summary: Request a return for an order
 *     tags: [Returns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - items
 *             properties:
 *               orderId:
 *                 type: string
 *               reason:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                    type: object
 *                    properties:
 *                       orderItemId:
 *                          type: string
 *                       quantity:
 *                          type: number
 *                       reason:
 *                          type: string
 *                       condition:
 *                          type: string
 *     responses:
 *       201:
 *         description: Return requested successfully
 *       400:
 *         description: Validation error or return window closed
 */
router.route('/request').post(isAuthenticated, requestReturn);

/**
 * @swagger
 * /returns/my-returns:
 *   get:
 *     summary: Get logged-in user's return requests
 *     tags: [Returns]
 *     responses:
 *       200:
 *         description: List of return requests
 */
router.route('/my-returns').get(isAuthenticated, getReturnRequests);

// Admin/Warehouse routes

/**
 * @swagger
 * /returns/admin/qc:
 *   patch:
 *     summary: Update QC status (Warehouse/Admin only)
 *     tags: [Returns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - returnRequestId
 *               - status
 *             properties:
 *               returnRequestId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [QC_Passed, QC_Failed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: QC status updated, Refund job triggered if passed
 */
router.route('/admin/qc')
    .patch(isAuthenticated, authorizeRoles('admin', 'warehouse'), updateQCStatus);

/**
 * @swagger
 * /returns/admin/requests:
 *   get:
 *     summary: Get all return requests (Admin/Warehouse)
 *     tags: [Returns]
 *     parameters:
 *       - inside: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of all return requests
 */
router.route('/admin/requests')
    .get(isAuthenticated, authorizeRoles('admin', 'warehouse', 'accountant'), getReturnRequests);

export default router;
