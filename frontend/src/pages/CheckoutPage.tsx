import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_address: user?.address ?? '',
    delivery_phone: user?.phone ?? '',
    notes: '',
    payment_method: 'stripe',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const total = totalAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity_kg: i.quantity_kg,
        })),
        delivery_address: form.delivery_address,
        delivery_phone: form.delivery_phone || undefined,
        notes: form.notes || undefined,
        payment_method: form.payment_method,
      };

      const res = await api.post('/orders', orderData);
      const order = res.data.data;
      setOrderId(order.id);
      clearCart();
      setSuccess(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Login Required</h2>
          <p className="text-stone-500 mb-4 text-sm">Please login to complete your order.</p>
          <Link to="/login?redirect=/checkout" className="bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto shadow-sm border border-stone-100">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Order Placed! 🎉</h2>
          <p className="text-stone-500 mb-1 text-sm">Your order #{orderId} has been received.</p>
          <p className="text-stone-500 mb-6 text-sm">We'll prepare your fresh fruits for delivery.</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="bg-green-700 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition-colors"
            >
              Track My Orders
            </Link>
            <Link to="/products" className="text-green-700 text-sm font-medium hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Cart is Empty</h2>
          <Link to="/products" className="text-green-700 font-medium underline text-sm">Browse fruits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {/* Delivery */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-green-600" />
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    value={form.delivery_address}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
                    rows={3}
                    placeholder="House no, Road, Area, District, City..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    <Phone size={11} className="inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.delivery_phone}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_phone: e.target.value }))}
                    placeholder="+880 1700-000000"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Any special instructions..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-green-600" />
                Payment Method
              </h2>

              <div className="space-y-2">
                {[
                  { value: 'stripe', label: 'Card / Online Payment', emoji: '💳' },
                  { value: 'cod', label: 'Cash on Delivery', emoji: '💵' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      form.payment_method === method.value
                        ? 'border-green-400 bg-green-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={form.payment_method === method.value}
                      onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                      className="text-green-600"
                    />
                    <span className="text-base">{method.emoji}</span>
                    <span className="text-sm font-medium text-stone-700">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-base hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : `Place Order — ৳${total.toFixed(0)}`}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-20">
              <h2 className="font-display text-lg font-bold text-stone-800 mb-4">Order Summary</h2>

              <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto">
                {items.map(({ product, quantity_kg }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <div className="flex-1 mr-2">
                      <p className="text-stone-700 font-medium truncate">{product.name}</p>
                      <p className="text-stone-400 text-xs">{quantity_kg}kg × ৳{Number(product.price_per_kg).toFixed(0)}</p>
                    </div>
                    <span className="font-semibold text-stone-800 flex-shrink-0">
                      ৳{(product.price_per_kg * quantity_kg).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>৳{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">TBD</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-stone-800 pt-2 border-t border-stone-100 mt-2">
                  <span>Total</span>
                  <span className="text-green-700">৳{total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
