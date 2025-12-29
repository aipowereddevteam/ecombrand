
import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import { getAllUsers, updateUserRole, getUserModules, updateUserModules } from '../controllers/adminController';

const router = express.Router();

// All routes are protected and admin-only
router.use(isAuthenticated);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

// Module Management
router.get('/users/:id/modules', getUserModules);
router.put('/users/:id/modules', updateUserModules);

export default router;
