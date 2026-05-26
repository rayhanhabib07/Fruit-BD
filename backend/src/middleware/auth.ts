import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import pool from '../config/database';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await pool.query(
      'SELECT id, name, email, role, address, phone, created_at FROM users WHERE id = $1',
      [decoded['id']]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'User not found', 401);
      return;
    }

    req.user = result.rows[0];
    next();
  } catch {
    errorResponse(res, 'Invalid or expired token', 401);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    errorResponse(res, 'Authentication required', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    errorResponse(res, 'Admin access required', 403);
    return;
  }

  next();
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      const result = await pool.query(
        'SELECT id, name, email, role, address, phone, created_at FROM users WHERE id = $1',
        [decoded['id']]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
};
