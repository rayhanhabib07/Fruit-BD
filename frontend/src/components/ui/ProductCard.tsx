import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const seasonColors: Record<string, string> = {
  summer: 'bg-orange-100 text-orange-700',
  winter: 'bg-blue-100 text-blue-700',
  spring: 'bg-pink-100 text-pink-700',
  autumn: 'bg-amber-100 text-amber-700',
  'year-round': 'bg-green-100 text-green-700',
};

const fruitEmoji: Record<string, string> = {
  Mango: '🥭',
  Banana: '🍌',
  Jackfruit: '🍈',
  Lychee: '🍒',
  Guava: '🍐',
  Papaya: '🧡',
  Watermelon: '🍉',
  Pineapple: '🍍',
  Orange: '🍊',
  Apple: '🍎',
  Strawberry: '🍓',
  Grape: '🍇',
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.is_available || product.stock_kg <= 0) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
    });
  };

  const emoji = Object.keys(fruitEmoji).find((k) =>
    product.name.toLowerCase().includes(k.toLowerCase())
  );

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-stone-100">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-green-50 to-amber-50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl animate-float">
                {emoji ? fruitEmoji[emoji] : '🍑'}
              </span>
            </div>
          )}

          {/* Season badge */}
          <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${seasonColors[product.season] ?? 'bg-gray-100 text-gray-600'}`}>
            {product.season}
          </span>

          {/* Out of stock overlay */}
          {(!product.is_available || product.stock_kg <= 0) && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-stone-500 bg-white px-3 py-1 rounded-full shadow">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-display font-semibold text-stone-800 text-base leading-tight">
              {product.name}
            </h3>
            {product.category_name && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                <Leaf size={10} />
                {product.category_name}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
            <div>
              <span className="text-lg font-bold text-green-700">৳{Number(product.price_per_kg).toFixed(0)}</span>
              <span className="text-xs text-stone-400 ml-1">/kg</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.is_available || product.stock_kg <= 0}
              className="flex items-center gap-1.5 bg-green-700 text-white text-xs px-3 py-2 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <ShoppingCart size={13} />
              Add
            </button>
          </div>

          {/* Stock indicator */}
          {product.stock_kg > 0 && product.stock_kg <= 10 && (
            <p className="text-xs text-orange-500 mt-2 font-medium">
              ⚡ Only {product.stock_kg}kg left
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
