import { Request, Response } from 'express';
import pool from '../../config/database';
import { successResponse, errorResponse } from '../../utils/response';
import { CreateOrderDto } from '../../types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const dto: CreateOrderDto = req.body;
    const userId = req.user?.id;

    if (!dto.items || dto.items.length === 0) {
      errorResponse(res, 'Order must contain at least one item', 400);
      return;
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const itemsWithPrices: Array<{
      product_id: number;
      quantity_kg: number;
      price_per_kg: number;
      name: string;
    }> = [];

    // Validate and calculate prices
    for (const item of dto.items) {
      const productResult = await client.query(
        'SELECT id, name, price_per_kg, stock_kg, is_available FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        errorResponse(res, `Product ${item.product_id} not found`, 404);
        return;
      }

      const product = productResult.rows[0];

      if (!product.is_available) {
        await client.query('ROLLBACK');
        errorResponse(res, `${product.name} is not available`, 400);
        return;
      }

      if (product.stock_kg < item.quantity_kg) {
        await client.query('ROLLBACK');
        errorResponse(
          res,
          `Insufficient stock for ${product.name}. Available: ${product.stock_kg}kg`,
          400
        );
        return;
      }

      totalAmount += product.price_per_kg * item.quantity_kg;
      itemsWithPrices.push({
        product_id: item.product_id,
        quantity_kg: item.quantity_kg,
        price_per_kg: product.price_per_kg,
        name: product.name,
      });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, delivery_address, delivery_phone, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        totalAmount,
        dto.delivery_address,
        dto.delivery_phone ?? null,
        dto.payment_method ?? 'stripe',
        dto.notes ?? null,
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items and update stock
    for (const item of itemsWithPrices) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity_kg, price_per_kg)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity_kg, item.price_per_kg]
      );

      await client.query(
        'UPDATE products SET stock_kg = stock_kg - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity_kg, item.product_id]
      );
    }

    await client.query('COMMIT');

    // Fetch complete order with items
    const completeOrder = await getOrderWithItems(order.id);
    successResponse(res, 'Order placed successfully', completeOrder, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    errorResponse(res, 'Failed to create order', 500);
  } finally {
    client.release();
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT o.*,
         json_agg(
           json_build_object(
             'id', oi.id,
             'product_id', oi.product_id,
             'product_name', p.name,
             'product_image', p.image_url,
             'quantity_kg', oi.quantity_kg,
             'price_per_kg', oi.price_per_kg,
             'subtotal', oi.subtotal
           )
         ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    successResponse(res, 'Orders retrieved', result.rows);
  } catch (error) {
    console.error('Get my orders error:', error);
    errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const order = await getOrderWithItems(parseInt(id, 10));

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    if (!isAdmin && order.user_id !== userId) {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    successResponse(res, 'Order retrieved', order);
  } catch (error) {
    console.error('Get order error:', error);
    errorResponse(res, 'Failed to retrieve order', 500);
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const params: (string | number)[] = [];

    if (status) {
      whereClause = 'WHERE o.status = $1';
      params.push(status as string);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders o ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
         json_agg(
           json_build_object(
             'id', oi.id,
             'product_id', oi.product_id,
             'product_name', p.name,
             'product_image', p.image_url,
             'quantity_kg', oi.quantity_kg,
             'price_per_kg', oi.price_per_kg,
             'subtotal', oi.subtotal
           )
         ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       ${whereClause}
       GROUP BY o.id, u.name, u.email
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, Number(limit), offset]
    );

    successResponse(res, 'Orders retrieved', result.rows, 200, {
      total,
      page: Number(page),
      limit: Number(limit),
      total_pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (status && !validStatuses.includes(status)) {
      errorResponse(res, 'Invalid order status', 400);
      return;
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           payment_status = COALESCE($2, payment_status),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status ?? null, payment_status ?? null, id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    successResponse(res, 'Order status updated', result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    errorResponse(res, 'Failed to update order status', 500);
  }
};

const getOrderWithItems = async (orderId: number) => {
  const result = await pool.query(
    `SELECT o.*, u.name as user_name, u.email as user_email,
       json_agg(
         json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', p.name,
           'product_image', p.image_url,
           'quantity_kg', oi.quantity_kg,
           'price_per_kg', oi.price_per_kg,
           'subtotal', oi.subtotal
         )
       ) as items
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.id = $1
     GROUP BY o.id, u.name, u.email`,
    [orderId]
  );

  return result.rows[0] ?? null;
};
