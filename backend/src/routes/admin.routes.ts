import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware.js';
import { updateUserRoleHandler } from '../controllers/admin.controller.js';

const router = Router();

// POST /api/admin/users/:uid/role - Restricted strictly to authenticated SuperAdmins
router.post('/users/:uid/role', requireAuth, requireSuperAdmin, updateUserRoleHandler);

export default router;
