export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  address: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  address: string | null;
  phone: string | null;
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price_per_kg: number;
  season: 'summer' | 'winter' | 'spring' | 'autumn' | 'year-round';
  category_id: number | null;
  category_name?: string;
  category_slug?: string;
  stock_kg: number;
  image_url: string | null;
  cloudinary_public_id: string | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: string;
  delivery_phone: string | null;
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_id: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  quantity_kg: number;
  price_per_kg: number;
  subtotal: number;
}

export interface CartItem {
  product_id: number;
  quantity_kg: number;
}

export interface CreateOrderDto {
  items: CartItem[];
  delivery_address: string;
  delivery_phone?: string;
  payment_method?: string;
  notes?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price_per_kg: number;
  season: 'summer' | 'winter' | 'spring' | 'autumn' | 'year-round';
  category_id?: number;
  stock_kg: number;
  is_available?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFilters {
  season?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
