import { Request, Response } from 'express';
import pool from '../../config/database';
import { successResponse, errorResponse } from '../../utils/response';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      revenueByMonth,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int as count FROM orders'),
      pool.query(
        "SELECT COALESCE(SUM(total_amount), 0)::numeric as total FROM orders WHERE payment_status = 'paid'"
      ),
      pool.query('SELECT COUNT(*)::int as count FROM products WHERE is_available = true'),
      pool.query("SELECT COUNT(*)::int as count FROM users WHERE role = 'customer'"),
      pool.query(
        `SELECT o.id, o.total_amount, o.status, o.created_at, u.name as user_name, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT id, name, stock_kg, image_url FROM products
         WHERE stock_kg < 5 AND is_available = true
         ORDER BY stock_kg ASC LIMIT 5`
      ),
      pool.query(
        `SELECT status, COUNT(*)::int as count FROM orders GROUP BY status`
      ),
      pool.query(
        `SELECT
           TO_CHAR(created_at, 'Mon YYYY') as month,
           DATE_TRUNC('month', created_at) as month_date,
           SUM(total_amount)::numeric as revenue,
           COUNT(*)::int as orders
         FROM orders
         WHERE payment_status = 'paid'
           AND created_at >= NOW() - INTERVAL '6 months'
         GROUP BY month, month_date
         ORDER BY month_date ASC`
      ),
    ]);

    successResponse(res, 'Dashboard stats retrieved', {
      stats: {
        total_orders: totalOrders.rows[0].count,
        total_revenue: parseFloat(totalRevenue.rows[0].total),
        total_products: totalProducts.rows[0].count,
        total_customers: totalUsers.rows[0].count,
      },
      recent_orders: recentOrders.rows,
      low_stock_products: lowStockProducts.rows,
      orders_by_status: ordersByStatus.rows,
      revenue_by_month: revenueByMonth.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    errorResponse(res, 'Failed to retrieve dashboard stats', 500);
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const params: (string | number)[] = [];

    if (role) {
      whereClause = 'WHERE role = $1';
      params.push(role as string);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int as count FROM users ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT id, name, email, role, phone, address, created_at FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, Number(limit), offset]
    );

    successResponse(res, 'Users retrieved', result.rows, 200, {
      total: countResult.rows[0].count,
      page: Number(page),
      limit: Number(limit),
      total_pages: Math.ceil(countResult.rows[0].count / Number(limit)),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    errorResponse(res, 'Failed to retrieve users', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      errorResponse(res, 'Invalid role', 400);
      return;
    }

    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, created_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, 'User role updated', result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    errorResponse(res, 'Failed to update user role', 500);
  }
};

export const getInventorySummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT
         p.id, p.name, p.season, p.stock_kg, p.price_per_kg,
         p.is_available, p.image_url,
         c.name as category_name,
         COALESCE(SUM(oi.quantity_kg), 0)::numeric as total_sold_kg,
         COUNT(DISTINCT oi.order_id)::int as order_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id, c.name
       ORDER BY p.stock_kg ASC`
    );
    successResponse(res, 'Inventory retrieved', result.rows);
  } catch (error) {
    console.error('Get inventory error:', error);
    errorResponse(res, 'Failed to retrieve inventory', 500);
  }
};
