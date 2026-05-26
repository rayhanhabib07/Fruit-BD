import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertTriangle, TrendingDown, Package, Save } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: number;
  name: string;
  season: string;
  stock_kg: number;
  price_per_kg: number;
  is_available: boolean;
  image_url: string | null;
  category_name: string | null;
  total_sold_kg: number;
  order_count: number;
}

export default function AdminInventory() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock_kg }: { id: number; stock_kg: number }) =>
      api.patch(`/products/${id}`, { stock_kg }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Stock updated!');
      setEditingId(null);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, is_available }: { id: number; is_available: boolean }) =>
      api.patch(`/products/${id}`, { is_available }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Availability updated!');
    },
  });

  const items: InventoryItem[] = data?.data ?? [];
  const lowStock = items.filter((i) => i.stock_kg < 5 && i.is_available);
  const outOfStock = items.filter((i) => i.stock_kg <= 0);

  const handleSaveStock = (id: number) => {
    const val = parseFloat(editStock);
    if (isNaN(val) || val < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }
    updateMutation.mutate({ id, stock_kg: val });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Inventory</h1>

      {/* Alert banners */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <TrendingDown size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {outOfStock.length} product{outOfStock.length > 1 ? 's' : ''} out of stock:{' '}
            {outOfStock.map((i) => i.name).join(', ')}
          </p>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            {lowStock.length} product{lowStock.length > 1 ? 's' : ''} running low (under 5kg):{' '}
            {lowStock.map((i) => i.name).join(', ')}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: items.length, color: 'text-stone-800' },
          { label: 'Available', value: items.filter((i) => i.is_available).length, color: 'text-green-700' },
          { label: 'Low Stock', value: lowStock.length, color: 'text-orange-600' },
          { label: 'Out of Stock', value: outOfStock.length, color: 'text-red-600' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 text-center"
          >
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Season
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Price/kg
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Stock (kg)
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Sold (kg)
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                  Available
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-8 bg-stone-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    No products in inventory
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const isLow = item.stock_kg > 0 && item.stock_kg < 5;
                const isEmpty = item.stock_kg <= 0;
                return (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-50 flex items-center justify-center flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base">🍑</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{item.name}</p>
                          <p className="text-xs text-stone-400">
                            {item.category_name ?? 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 capitalize text-xs">{item.season}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      ৳{Number(item.price_per_kg).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            step="0.1"
                            min="0"
                            autoFocus
                            className="w-20 border border-green-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                          <button
                            onClick={() => handleSaveStock(item.id)}
                            disabled={updateMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-stone-400 hover:text-stone-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditStock(item.stock_kg.toString());
                          }}
                          className={`font-semibold hover:underline transition-colors ${
                            isEmpty
                              ? 'text-red-500'
                              : isLow
                              ? 'text-orange-500'
                              : 'text-stone-700'
                          }`}
                          title="Click to edit"
                        >
                          {isEmpty ? '0 ⚠️' : `${item.stock_kg}kg`}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {Number(item.total_sold_kg).toFixed(1)}kg
                    </td>
                    <td className="px-4 py-3 text-stone-600">{item.order_count}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleAvailability.mutate({
                            id: item.id,
                            is_available: !item.is_available,
                          })
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          item.is_available ? 'bg-green-500' : 'bg-stone-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            item.is_available ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
