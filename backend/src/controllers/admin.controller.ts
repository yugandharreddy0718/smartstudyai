import { Request, Response } from 'express';
import { syncUserRole, isValidRole, ALLOWED_ROLES } from '../services/authRoleService.js';

export async function updateUserRoleHandler(req: Request, res: Response) {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!uid || typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({ error: 'Invalid user ID parameter.' });
    }

    if (!role || !isValidRole(role)) {
      return res.status(400).json({
        error: `Invalid role parameter "${role}". Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
      });
    }

    const result = await syncUserRole(uid.trim(), role);

    return res.status(200).json({
      message: `Successfully updated user role for ${uid} to "${role}".`,
      data: result
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while updating the user role.'
    });
  }
}
