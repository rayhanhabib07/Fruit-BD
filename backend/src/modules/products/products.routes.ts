import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './products.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validateRequest } from '../../middleware/validate';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price_per_kg')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('season')
      .isIn(['summer', 'winter', 'spring', 'autumn', 'year-round'])
      .withMessage('Invalid season'),
    body('stock_kg').isFloat({ min: 0 }).withMessage('Stock must be a positive number'),
  ],
  validateRequest,
  createProduct
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('image'),
  updateProduct
);

router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
