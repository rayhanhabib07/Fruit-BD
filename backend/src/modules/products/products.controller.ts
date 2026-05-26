import { Request, Response } from 'express';
import pool from '../../config/database';
import cloudinary from '../../config/cloudinary';
import { successResponse, errorResponse } from '../../utils/response';
import { CreateProductDto, UpdateProductDto, ProductFilters } from '../../types';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      season,
      category,
      min_price,
      max_price,
      is_available,
      search,
      page = 1,
      limit = 12,
    }: ProductFilters = req.query as ProductFilters;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (season) {
      conditions.push(`p.season = $${paramIndex++}`);
      params.push(season);
    }

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      params.push(category);
    }

    if (min_price) {
      conditions.push(`p.price_per_kg >= $${paramIndex++}`);
      params.push(Number(min_price));
    }

    if (max_price) {
      conditions.push(`p.price_per_kg <= $${paramIndex++}`);
      params.push(Number(max_price));
    }

    if (is_available !== undefined) {
      conditions.push(`p.is_available = $${paramIndex++}`);
      params.push(is_available === true || is_available === ('true' as unknown));
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    successResponse(
      res,
      'Products retrieved',
      result.rows,
      200,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / Number(limit)),
      }
    );
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, 'Failed to retrieve products', 500);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    successResponse(res, 'Product retrieved', result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 'Failed to retrieve product', 500);
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_available = true AND p.stock_kg > 0
       ORDER BY p.created_at DESC
       LIMIT 8`
    );

    successResponse(res, 'Featured products retrieved', result.rows);
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Failed to retrieve featured products', 500);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: CreateProductDto = req.body;
    let imageUrl: string | null = null;
    let cloudinaryPublicId: string | null = null;

    if (req.file) {
      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'fruitbd/products', transformation: [{ width: 800, crop: 'limit' }] },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            }
          );
          stream.end(req.file?.buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    const result = await pool.query(
      `INSERT INTO products
         (name, description, price_per_kg, season, category_id, stock_kg, image_url, cloudinary_public_id, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        dto.name,
        dto.description ?? null,
        dto.price_per_kg,
        dto.season,
        dto.category_id ?? null,
        dto.stock_kg,
        imageUrl,
        cloudinaryPublicId,
        dto.is_available ?? true,
      ]
    );

    successResponse(res, 'Product created', result.rows[0], 201);
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dto: UpdateProductDto = req.body;

    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    let imageUrl = existing.rows[0].image_url;
    let cloudinaryPublicId = existing.rows[0].cloudinary_public_id;

    if (req.file) {
      // Delete old image
      if (cloudinaryPublicId) {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
      }

      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'fruitbd/products', transformation: [{ width: 800, crop: 'limit' }] },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            }
          );
          stream.end(req.file?.buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price_per_kg = COALESCE($3, price_per_kg),
         season = COALESCE($4, season),
         category_id = COALESCE($5, category_id),
         stock_kg = COALESCE($6, stock_kg),
         image_url = $7,
         cloudinary_public_id = $8,
         is_available = COALESCE($9, is_available),
         updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        dto.name ?? null,
        dto.description ?? null,
        dto.price_per_kg ?? null,
        dto.season ?? null,
        dto.category_id ?? null,
        dto.stock_kg ?? null,
        imageUrl,
        cloudinaryPublicId,
        dto.is_available ?? null,
        id,
      ]
    );

    successResponse(res, 'Product updated', result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Delete cloudinary image
    if (existing.rows[0].cloudinary_public_id) {
      await cloudinary.uploader.destroy(existing.rows[0].cloudinary_public_id);
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    successResponse(res, 'Product deleted');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Failed to delete product', 500);
  }
};
