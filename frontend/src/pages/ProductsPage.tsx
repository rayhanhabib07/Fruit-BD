import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ui/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') ?? '',
    season: searchParams.get('season') ?? '',
    category: searchParams.get('category') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
    page: 1,
  });

  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') ?? '',
      season: searchParams.get('season') ?? '',
      category: searchParams.get('category') ?? '',
      min_price: searchParams.get('min_price') ?? '',
      max_price: searchParams.get('max_price') ?? '',
      page: 1,
    };
    setFilters(newFilters);
  }, [searchParams]);

  const queryString = new URLSearchParams({
    ...(filters.search && { search: filters.search }),
    ...(filters.season && { season: filters.season }),
    ...(filters.category && { category: filters.category }),
    ...(filters.min_price && { min_price: filters.min_price }),
    ...(filters.max_price && { max_price: filters.max_price }),
    page: filters.page.toString(),
    limit: '12',
  }).toString();

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products', queryString],
    queryFn: () => api.get(`/products?${queryString}`).then((r) => r.data),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const products: Product[] = productsRes?.data ?? [];
  const categories: Category[] = categoriesRes?.data ?? [];
  const meta = productsRes?.meta;

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v.toString());
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', season: '', category: '', min_price: '', max_price: '', page: 1 });
    setSearchParams(new URLSearchParams());
  };

  const seasons = ['summer', 'winter', 'spring', 'autumn', 'year-round'];
  const hasActiveFilters = filters.search || filters.season || filters.category || filters.min_price || filters.max_price;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-stone-800 mb-2">
            {filters.season ? `${filters.season.charAt(0).toUpperCase() + filters.season.slice(1)} Fruits` : 'All Fruits'}
          </h1>
          <p className="text-stone-500 text-sm">
            {meta ? `${meta.total} fruits available` : 'Browse our collection'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search fruits..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'bg-green-700 text-white border-green-700' : 'bg-white border-stone-200 text-stone-700 hover:border-green-400'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 hover:text-red-600 font-medium"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Season */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Season</label>
              <div className="flex flex-wrap gap-1.5">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilter('season', filters.season === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filters.season === s
                        ? 'bg-green-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Min Price (৳/kg)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_price}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Max Price (৳/kg)</label>
              <input
                type="number"
                placeholder="9999"
                value={filters.max_price}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-8 bg-stone-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-display text-lg">No fruits found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 text-green-700 text-sm font-medium underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      filters.page === p
                        ? 'bg-green-700 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:border-green-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
