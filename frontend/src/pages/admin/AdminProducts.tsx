import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../lib/api';
import type { Product, Category } from '../../types';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  description: string;
  price_per_kg: string;
  season: string;
  category_id: string;
  stock_kg: string;
  is_available: boolean;
  image?: File | null;
}

const emptyForm: ProductFormData = {
  name: '', description: '', price_per_kg: '', season: 'year-round',
  category_id: '', stock_kg: '', is_available: true, image: null,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const { data: productsRes } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products?limit=100').then((r) => r.data),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const products: Product[] = productsRes?.data ?? [];
  const categories: Category[] = categoriesRes?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editProduct) {
        return api.patch(`/products/${editProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editProduct ? 'Product updated!' : 'Product created!');
      setShowModal(false);
      setEditProduct(null);
      setForm(emptyForm);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message ?? 'Failed to save product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      price_per_kg: product.price_per_kg.toString(),
      season: product.season,
      category_id: product.category_id?.toString() ?? '',
      stock_kg: product.stock_kg.toString(),
      is_available: product.is_available,
      image: null,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price_per_kg', form.price_per_kg);
    fd.append('season', form.season);
    if (form.category_id) fd.append('category_id', form.category_id);
    fd.append('stock_kg', form.stock_kg);
    fd.append('is_available', form.is_available.toString());
    if (form.image) fd.append('image', form.image);
    saveMutation.mutate(fd);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Season</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Price/kg</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-stone-400">No products yet. Add your first fruit!</td></tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-green-50 flex items-center justify-center flex-shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <span className="text-lg">🍑</span>}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.category_name ?? 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600 capitalize">{product.season}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">৳{Number(product.price_per_kg).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${product.stock_kg <= 5 ? 'text-red-500' : 'text-stone-700'}`}>
                      {product.stock_kg}kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {product.is_available ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this product?')) deleteMutation.mutate(product.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Mango, Banana..." className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Price/kg (৳) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price_per_kg} onChange={(e) => setForm((f) => ({ ...f, price_per_kg: e.target.value }))}
                    placeholder="0.00" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Stock (kg) *</label>
                  <input required type="number" step="0.1" min="0" value={form.stock_kg} onChange={(e) => setForm((f) => ({ ...f, stock_kg: e.target.value }))}
                    placeholder="0" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Season *</label>
                  <select value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    {['summer', 'winter', 'spring', 'autumn', 'year-round'].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe this fruit..." className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] ?? null }))}
                  className="w-full text-sm text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:text-xs file:font-medium" />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-stone-700">Available for purchase</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, is_available: !f.is_available }))}
                  className={`transition-colors ${form.is_available ? 'text-green-600' : 'text-stone-400'}`}>
                  {form.is_available ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60">
                  {saveMutation.isPending ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
