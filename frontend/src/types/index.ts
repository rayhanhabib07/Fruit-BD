export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price_per_kg: number;
  season: 'summer' | 'winter' | 'spring' | 'autumn' | 'year-round';
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  stock_kg: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity_kg: number;
  price_per_kg: number;
  subtotal: number;
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
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity_kg: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface DashboardStats {
  stats: {
    total_orders: number;
    total_revenue: number;
    total_products: number;
    total_customers: number;
  };
  recent_orders: Order[];
  low_stock_products: Product[];
  orders_by_status: { status: string; count: number }[];
  revenue_by_month: { month: string; revenue: number; orders: number }[];
}
