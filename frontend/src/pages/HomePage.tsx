import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import api from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ui/ProductCard';

export default function HomePage() {
  const { data: featuredRes } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const products: Product[] = featuredRes?.data ?? [];
  const categories: Category[] = categoriesRes?.data ?? [];

  const seasons = [
    { id: 'summer', label: 'Summer', emoji: '☀️', color: 'from-orange-100 to-yellow-50', textColor: 'text-orange-700', desc: 'Mangoes, Lychee, Jackfruit' },
    { id: 'winter', label: 'Winter', emoji: '❄️', color: 'from-blue-100 to-cyan-50', textColor: 'text-blue-700', desc: 'Oranges, Dates, Guava' },
    { id: 'spring', label: 'Spring', emoji: '🌸', color: 'from-pink-100 to-rose-50', textColor: 'text-pink-700', desc: 'Strawberries, Papaya' },
    { id: 'year-round', label: 'All Year', emoji: '🌿', color: 'from-green-100 to-emerald-50', textColor: 'text-green-700', desc: 'Banana, Pineapple, Coconut' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍋</div>
          <div className="absolute top-20 right-20 text-7xl">🍊</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">🍇</div>
          <div className="absolute top-1/2 right-10 text-5xl">🥭</div>
          <div className="absolute bottom-20 right-1/3 text-7xl">🍍</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles size={14} className="text-yellow-300" />
              Bangladesh's Freshest Seasonal Fruits
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Nature's Best,
              <br />
              <span className="text-yellow-300 italic">Delivered Fresh</span>
            </h1>
            <p className="text-lg text-green-100 leading-relaxed mb-8 max-w-lg">
              From the orchards of Bangladesh to your doorstep. Hand-picked seasonal fruits, 
              priced by the kilo, delivered with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors text-sm"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/products?season=summer"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors text-sm"
              >
                ☀️ Summer Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="#fafaf7" />
          </svg>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Truck size={20} />, title: 'Fast Delivery', desc: 'Same day delivery in Dhaka' },
            { icon: <Leaf size={20} />, title: '100% Fresh', desc: 'Directly from local farms' },
            { icon: <ShieldCheck size={20} />, title: 'Quality Assured', desc: 'Hand-picked and inspected' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-stone-100">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">{item.title}</p>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seasons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-800">
            Shop by Season
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map((season) => (
            <Link
              key={season.id}
              to={`/products?season=${season.id}`}
              className={`group bg-gradient-to-br ${season.color} rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <div className="text-3xl mb-2">{season.emoji}</div>
              <h3 className={`font-semibold ${season.textColor} text-base`}>{season.label}</h3>
              <p className="text-xs text-stone-500 mt-1">{season.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-800 mb-6">
            Browse Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-full text-sm hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all"
              >
                <Leaf size={12} />
                {cat.name}
                <span className="text-xs text-stone-400">({cat.product_count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-800">
            Fresh Arrivals
          </h2>
          <Link
            to="/products"
            className="text-sm text-green-700 font-medium hover:text-green-800 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">🍃</div>
            <p className="text-lg font-display">Fruits coming soon...</p>
            <p className="text-sm mt-1">Check back for our seasonal selections</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
