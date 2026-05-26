import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, CreditCard, Clock } from 'lucide-react';
import api from '../lib/api';
import type { Order } from '../types';
import { useAuthStore } from '../store/authStore';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'processing', label: 'Processing', icon: '🔪' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!user,
  });

  const order: Order | undefined = data?.data;

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">Login Required</h2>
          <Link to="/login" className="bg-green-700 text-white px-6 py-3 rounded-full font-medium">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Order not found</h2>
          <Link to="/orders" className="text-green-700 font-medium underline">
            Back to my orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-800">Order #{order.id}</h1>
            <p className="text-sm text-stone-400 mt-1 flex items-center gap-1.5">
              <Clock size={13} />
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                statusColors[order.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <p
              className={`text-xs mt-1.5 font-medium ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'
              }`}
            >
              {order.payment_status === 'paid' ? '✓ Payment received' : '⏳ Payment pending'}
            </p>
          </div>
        </div>

        {/* Tracking timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-5">
            <h2 className="font-semibold text-stone-800 mb-5 text-sm uppercase tracking-wider">
              Order Tracking
            </h2>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-100 mx-10">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 w-1/5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all ${
                          active
                            ? 'bg-green-600 shadow-lg shadow-green-200 scale-110'
                            : done
                            ? 'bg-green-500'
                            : 'bg-stone-100'
                        }`}
                      >
                        {done ? (
                          <span className={active ? 'animate-bounce' : ''}>{step.icon}</span>
                        ) : (
                          <span className="text-stone-300 text-sm">{idx + 1}</span>
                        )}
                      </div>
                      <p
                        className={`text-center text-xs font-medium leading-tight ${
                          done ? 'text-green-700' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 text-center">
            <p className="text-red-600 font-semibold">❌ This order has been cancelled</p>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-stone-50">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <Package size={16} className="text-green-600" />
              Items Ordered
            </h2>
          </div>
          <div className="divide-y divide-stone-50">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 flex-shrink-0">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍑
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{item.product_name}</p>
                  <p className="text-sm text-stone-400">
                    {item.quantity_kg}kg × ৳{Number(item.price_per_kg).toFixed(0)}/kg
                  </p>
                </div>
                <p className="font-bold text-stone-800">৳{Number(item.subtotal).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-stone-50 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">Total Amount</span>
              <span className="text-xl font-bold text-green-700">
                ৳{Number(order.total_amount).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery + Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2 text-sm">
              <MapPin size={15} className="text-green-600" />
              Delivery Address
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">{order.delivery_address}</p>
            {order.delivery_phone && (
              <p className="text-sm text-stone-500 mt-2 flex items-center gap-1.5">
                <Phone size={12} />
                {order.delivery_phone}
              </p>
            )}
            {order.notes && (
              <p className="text-xs text-stone-400 mt-2 italic bg-stone-50 rounded-lg p-2">
                📝 {order.notes}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2 text-sm">
              <CreditCard size={15} className="text-green-600" />
              Payment Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-medium text-stone-700 capitalize">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span
                  className={`font-semibold ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'
                  }`}
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total</span>
                <span className="font-bold text-green-700">
                  ৳{Number(order.total_amount).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition-colors text-sm"
          >
            🍎 Order More Fruits
          </Link>
        </div>
      </div>
    </div>
  );
}
