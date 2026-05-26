import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
} from './categories.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
  ],
  validateRequest,
  createCategory
);

router.patch('/:id', authenticate, requireAdmin, updateCategory);

export default router;
