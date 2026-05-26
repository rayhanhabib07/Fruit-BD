import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity_kg: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity_kg: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity_kg) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity_kg: Math.min(i.quantity_kg + quantity_kg, product.stock_kg) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity_kg }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity_kg) => {
        if (quantity_kg <= 0) {
          set({ items: get().items.filter((i) => i.product.id !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity_kg } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.length,

      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price_per_kg * item.quantity_kg,
          0
        ),
    }),
    { name: 'fruitbd-cart' }
  )
);
