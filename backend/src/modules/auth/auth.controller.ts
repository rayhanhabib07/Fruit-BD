import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { successResponse, errorResponse } from '../../utils/response';
import { RegisterDto, LoginDto, User, PublicUser } from '../../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address }: RegisterDto = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'Email already registered', 409);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query<User>(
      `INSERT INTO users (name, email, password, role, phone, address)
       VALUES ($1, $2, $3, 'customer', $4, $5)
       RETURNING id, name, email, role, address, phone, created_at`,
      [name, email.toLowerCase(), hashedPassword, phone ?? null, address ?? null]
    );

    const user: PublicUser = result.rows[0];
    const token = generateToken(user);

    successResponse(res, 'Registration successful', { user, token }, 201);
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDto = req.body;

    // Find user
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      phone: user.phone,
      created_at: user.created_at,
    };

    const token = generateToken(publicUser);

    successResponse(res, 'Login successful', { user: publicUser, token });
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Login failed', 500);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, address, phone, created_at FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, 'Profile retrieved', result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user?.id;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, role, address, phone, created_at`,
      [name ?? null, phone ?? null, address ?? null, userId]
    );

    successResponse(res, 'Profile updated', result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Failed to update profile', 500);
  }
};
