import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCartStore();
  const total = totalAmount();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-6 text-sm">Add some fresh fruits to get started!</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Browse Fruits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-800">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-500 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity_kg }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍑</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">৳{Number(product.price_per_kg).toFixed(0)}/kg</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, Math.max(0.5, quantity_kg - 0.5))}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-14 text-center">{quantity_kg}kg</span>
                    <button
                      onClick={() => updateQuantity(product.id, Math.min(product.stock_kg, quantity_kg + 0.5))}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Price + remove */}
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-stone-800 text-sm">
                    ৳{(product.price_per_kg * quantity_kg).toFixed(0)}
                  </span>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-20">
              <h2 className="font-display text-lg font-bold text-stone-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {items.map(({ product, quantity_kg }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-stone-500 truncate mr-2">
                      {product.name} ({quantity_kg}kg)
                    </span>
                    <span className="font-medium text-stone-700 flex-shrink-0">
                      ৳{(product.price_per_kg * quantity_kg).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 mb-5">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Total</span>
                  <span className="font-bold text-xl text-green-700">৳{total.toFixed(0)}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1">+ Delivery charges at checkout</p>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-green-700 text-white py-3.5 rounded-xl font-semibold hover:bg-green-800 transition-colors"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className="mt-3 block text-center text-sm text-stone-500 hover:text-green-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
