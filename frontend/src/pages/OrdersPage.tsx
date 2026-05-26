import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import api from '../lib/api';
import type { Order } from '../types';
import { useAuthStore } from '../store/authStore';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my-orders').then((r) => r.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Login Required</h2>
          <Link to="/login" className="bg-green-700 text-white px-6 py-3 rounded-full font-medium">Login</Link>
        </div>
      </div>
    );
  }

  const orders: Order[] = data?.data ?? [];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-stone-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-stone-300 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-stone-600 mb-2">No orders yet</h2>
            <p className="text-stone-400 text-sm mb-6">Start shopping for fresh fruits!</p>
            <Link to="/products" className="bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition-colors">
              Browse Fruits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const stepIndex = statusSteps.indexOf(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-stone-400 mb-0.5">Order #{order.id}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {order.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-700">৳{Number(order.total_amount).toFixed(0)}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1 justify-end">
                          <Clock size={10} />
                          {new Date(order.created_at).toLocaleDateString('en-BD', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="text-xs text-stone-500 mb-3">
                      {order.items?.slice(0, 3).map((item) => (
                        <span key={item.id} className="mr-2">
                          {item.product_name} ({item.quantity_kg}kg)
                        </span>
                      ))}
                      {(order.items?.length ?? 0) > 3 && (
                        <span>+{(order.items?.length ?? 0) - 3} more</span>
                      )}
                    </div>

                    {/* Progress bar (only for non-cancelled) */}
                    {order.status !== 'cancelled' && stepIndex >= 0 && (
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, idx) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              idx <= stepIndex ? 'bg-green-500' : 'bg-stone-100'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 bg-stone-50 flex items-center justify-between border-t border-stone-100">
                    <p className="text-xs text-stone-400 truncate">{order.delivery_address}</p>
                    <ChevronRight size={14} className="text-stone-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
