import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import type { DashboardStats } from '../../types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data),
  });

  const stats: DashboardStats | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats?.stats.total_orders ?? 0, icon: <ShoppingBag size={20} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Revenue (paid)', value: `৳${(stats?.stats.total_revenue ?? 0).toFixed(0)}`, icon: <TrendingUp size={20} />, color: 'text-green-600 bg-green-50' },
    { label: 'Products', value: stats?.stats.total_products ?? 0, icon: <Package size={20} />, color: 'text-orange-600 bg-orange-50' },
    { label: 'Customers', value: stats?.stats.total_customers ?? 0, icon: <Users size={20} />, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-stone-800">{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-50">
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-green-700 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {stats?.recent_orders.length === 0 && (
              <p className="text-center text-stone-400 py-8 text-sm">No orders yet</p>
            )}
            {stats?.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-stone-800">{order.user_name}</p>
                  <p className="text-xs text-stone-400">#{order.id} · {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold text-sm text-stone-800">৳{Number(order.total_amount).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-50">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              Low Stock
            </h2>
            <Link to="/admin/products" className="text-xs text-green-700 font-medium hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {stats?.low_stock_products.length === 0 && (
              <p className="text-center text-stone-400 py-8 text-sm">All stocked up! 🎉</p>
            )}
            {stats?.low_stock_products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-medium text-stone-700">{product.name}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  product.stock_kg <= 2 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {product.stock_kg}kg left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by status */}
      {stats?.orders_by_status && stats.orders_by_status.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
          <h2 className="font-semibold text-stone-800 mb-4">Orders by Status</h2>
          <div className="flex flex-wrap gap-3">
            {stats.orders_by_status.map(({ status, count }) => (
              <div key={status} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
