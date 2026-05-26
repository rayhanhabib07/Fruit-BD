import { Router } from 'express';
import {
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
} from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Stripe webhook (raw body needed)
router.post('/webhook/stripe', stripeWebhook);

// Authenticated payment routes
router.post('/stripe/create-intent', authenticate, createStripePaymentIntent);
router.post('/stripe/confirm', authenticate, confirmStripePayment);

export default router;
