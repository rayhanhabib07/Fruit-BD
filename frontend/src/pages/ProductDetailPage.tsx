import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Leaf, Package, Scale } from 'lucide-react';
import api from '../lib/api';
import type { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const seasonColors: Record<string, string> = {
  summer: 'bg-orange-100 text-orange-700',
  winter: 'bg-blue-100 text-blue-700',
  spring: 'bg-pink-100 text-pink-700',
  autumn: 'bg-amber-100 text-amber-700',
  'year-round': 'bg-green-100 text-green-700',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const product: Product | undefined = data?.data;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success(`${qty}kg of ${product.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-96 bg-stone-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-100 rounded w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-1/2" />
            <div className="h-20 bg-stone-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="font-display text-2xl font-bold text-stone-700">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-green-700 font-medium underline">
          Browse all fruits
        </Link>
      </div>
    );
  }

  const maxQty = Math.min(product.stock_kg, 50);
  const subtotal = (product.price_per_kg * qty).toFixed(2);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 shadow-sm">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl animate-float">🍑</span>
                </div>
              )}
            </div>

            {/* Season badge */}
            <span className={`absolute top-4 left-4 text-sm font-medium px-3 py-1.5 rounded-full ${seasonColors[product.season] ?? 'bg-gray-100 text-gray-600'}`}>
              {product.season}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category_name && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
                <Leaf size={11} /> {product.category_name}
              </span>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-800 mb-3">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-stone-500 leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="bg-green-50 rounded-2xl p-5 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-700">৳{Number(product.price_per_kg).toFixed(0)}</span>
                <span className="text-stone-500">per kg</span>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-1.5 text-stone-600">
                <Package size={15} />
                <span>
                  {product.stock_kg > 0
                    ? `${product.stock_kg}kg in stock`
                    : 'Out of stock'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <Scale size={15} />
                <span>Sold by the kilogram</span>
              </div>
            </div>

            {/* Quantity selector */}
            {product.is_available && product.stock_kg > 0 && (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Quantity (kg)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty((q) => Math.max(0.5, q - 0.5))}
                      className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 text-lg font-bold hover:bg-stone-200 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-20 text-center text-xl font-bold text-stone-800">
                      {qty}kg
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxQty, q + 0.5))}
                      className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 text-lg font-bold hover:bg-stone-200 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <p className="text-sm text-stone-500 mb-5">
                  Subtotal: <span className="font-bold text-stone-800 text-base">৳{subtotal}</span>
                </p>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-base hover:bg-green-800 transition-colors"
                >
                  <ShoppingCart size={18} />
                  Add to Cart — ৳{subtotal}
                </button>

                <Link
                  to="/cart"
                  className="mt-3 block text-center text-sm text-green-700 font-medium hover:underline"
                >
                  View Cart
                </Link>
              </>
            )}

            {(!product.is_available || product.stock_kg <= 0) && (
              <div className="bg-stone-100 rounded-2xl p-4 text-center text-stone-500 font-medium">
                Currently out of stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
