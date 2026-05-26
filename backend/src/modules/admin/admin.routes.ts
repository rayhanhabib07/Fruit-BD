import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getInventorySummary,
} from './admin.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/inventory', getInventorySummary);

export default router;
