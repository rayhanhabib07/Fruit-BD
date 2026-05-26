import { Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../../config/database';
import { successResponse, errorResponse } from '../../utils/response';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

export const createStripePaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.body;
    const userId = req.user?.id;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [order_id, userId]
    );

    if (orderResult.rows.length === 0) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'paid') {
      errorResponse(res, 'Order already paid', 400);
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id.toString(),
        user_id: userId?.toString() ?? '',
      },
    });

    // Save payment intent id
    await pool.query(
      'UPDATE orders SET payment_id = $1 WHERE id = $2',
      [paymentIntent.id, order_id]
    );

    successResponse(res, 'Payment intent created', {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    errorResponse(res, 'Failed to create payment intent', 500);
  }
};

export const confirmStripePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_intent_id, order_id } = req.body;
    const userId = req.user?.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      await pool.query(
        `UPDATE orders SET
           payment_status = 'paid',
           status = 'confirmed',
           updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [order_id, userId]
      );

      successResponse(res, 'Payment confirmed successfully');
    } else {
      errorResponse(res, 'Payment not completed', 400);
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    errorResponse(res, 'Failed to confirm payment', 500);
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  try {
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      webhookSecret
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata['order_id'];

      if (orderId) {
        await pool.query(
          `UPDATE orders SET
             payment_status = 'paid',
             status = 'confirmed',
             updated_at = NOW()
           WHERE payment_id = $1`,
          [paymentIntent.id]
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};
