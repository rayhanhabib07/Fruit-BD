import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes from './modules/orders/orders.routes';
import categoryRoutes from './modules/categories/categories.routes';
import adminRoutes from './modules/admin/admin.routes';
import paymentRoutes from './modules/payments/payments.routes';
import { notFound, errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));

// Middleware
const allowedOrigin = (process.env.FRONTEND_URL ?? 'http://localhost:3000').trim().replace(/\/$/, '');
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'FruitBD API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🍎 FruitBD API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});

export default app;
