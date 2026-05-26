import pool from './database';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_per_kg DECIMAL(10, 2) NOT NULL,
        season VARCHAR(50) NOT NULL CHECK (season IN ('summer', 'winter', 'spring', 'autumn', 'year-round')),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        stock_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
        image_url TEXT,
        cloudinary_public_id VARCHAR(255),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
          status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
        ),
        delivery_address TEXT NOT NULL,
        delivery_phone VARCHAR(20),
        payment_method VARCHAR(30) DEFAULT 'stripe',
        payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
        payment_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity_kg DECIMAL(10, 2) NOT NULL,
        price_per_kg DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_kg * price_per_kg) STORED,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed default categories
    await client.query(`
      INSERT INTO categories (name, slug, description) VALUES
        ('Tropical', 'tropical', 'Exotic tropical fruits'),
        ('Citrus', 'citrus', 'Refreshing citrus fruits'),
        ('Stone Fruits', 'stone-fruits', 'Fruits with a hard pit'),
        ('Berries', 'berries', 'Small, sweet berries'),
        ('Melons', 'melons', 'Refreshing melons'),
        ('Dried Fruits', 'dried-fruits', 'Sun-dried preserved fruits')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Seed demo admin user (password: Admin@123)
    await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Admin User', 'admin@fruitbd.com', '$2a$10$YmKJjLp5.d5KnGJp1mK8QOxNhPE7/Icp4TMWC3XJvT.Ci8GBvhS2W', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully');
    console.log('📧 Admin login: admin@fruitbd.com / Admin@123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch(console.error);
