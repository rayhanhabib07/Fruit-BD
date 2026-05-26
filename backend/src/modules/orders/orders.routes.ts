import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from './orders.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';

const router = Router();

// Customer routes
router.post(
  '/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
    body('items.*.quantity_kg')
      .isFloat({ min: 0.1 })
      .withMessage('Quantity must be at least 0.1 kg'),
    body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
  ],
  validateRequest,
  createOrder
);

router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
