import { Request, Response } from 'express';
import pool from '../../config/database';
import { successResponse, errorResponse } from '../../utils/response';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_available = true
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    successResponse(res, 'Categories retrieved', result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    errorResponse(res, 'Failed to retrieve categories', 500);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    if (result.rows.length === 0) {
      errorResponse(res, 'Category not found', 404);
      return;
    }
    successResponse(res, 'Category retrieved', result.rows[0]);
  } catch (error) {
    console.error('Get category error:', error);
    errorResponse(res, 'Failed to retrieve category', 500);
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description } = req.body;
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, description ?? null]
    );
    successResponse(res, 'Category created', result.rows[0], 201);
  } catch (error) {
    console.error('Create category error:', error);
    errorResponse(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await pool.query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         description = COALESCE($2, description)
       WHERE id = $3 RETURNING *`,
      [name ?? null, description ?? null, id]
    );
    if (result.rows.length === 0) {
      errorResponse(res, 'Category not found', 404);
      return;
    }
    successResponse(res, 'Category updated', result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    errorResponse(res, 'Failed to update category', 500);
  }
};
