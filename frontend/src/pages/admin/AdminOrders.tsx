import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import type { Order } from '../../types';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: () =>
      api.get(`/orders?limit=50${filterStatus ? `&status=${filterStatus}` : ''}`).then((r) => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const orders: Order[] = data?.data ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Orders</h1>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">All Status</option>
            {allStatuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg font-display">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {/* Summary row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">#{order.id} — {order.user_name}</p>
                    <p className="text-xs text-stone-400">{order.user_email} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-700">৳{Number(order.total_amount).toFixed(0)}</span>

                  {/* Status dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ id: order.id, status: e.target.value })
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none pr-6 ${statusColors[order.status] ?? ''}`}
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {order.payment_status}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-stone-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="border-t border-stone-100 px-5 py-4 bg-stone-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-stone-700">{item.product_name} ({item.quantity_kg}kg)</span>
                            <span className="font-medium text-stone-800">৳{Number(item.subtotal).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Delivery</p>
                      <p className="text-sm text-stone-700">{order.delivery_address}</p>
                      {order.delivery_phone && <p className="text-sm text-stone-500 mt-1">{order.delivery_phone}</p>}
                      {order.notes && <p className="text-xs text-stone-400 mt-2 italic">Note: {order.notes}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
