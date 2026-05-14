import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/products/ProductCard';
import { Filter, ChevronDown, LayoutGrid, LayoutList, Search as SearchIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    search: queryParams.get('search') || '',
    sort: 'newest'
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: queryParams.get('category') || '',
      search: queryParams.get('search') || ''
    }));
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [prodRes, catsRes] = await Promise.all([
          api.get('/products', { 
            category: filters.category, 
            search: filters.search, 
            sort: filters.sort 
          }),
          api.get('/products/categories')
        ]);
        setProducts(prodRes.data.products);
        setCategories(catsRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-6">
        <div>
          <h1 className="font-display text-6xl mb-4 italic capitalize">
            {filters.category ? filters.category.replace('-', ' ') : filters.search ? `Search: ${filters.search}` : 'Entire Collection'}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Discover {products.length} Items of Distinction</p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6 border-b border-gold/20 pb-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Sort By</span>
            <select 
              className="bg-transparent text-xs uppercase tracking-widest font-bold outline-none cursor-pointer"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-12">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6">Categories</h4>
            <ul className="space-y-4 text-xs tracking-widest uppercase font-medium">
              <li>
                <button 
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className={`${!filters.category ? 'text-gold' : 'opacity-60'} hover:text-gold transition-colors`}
                >
                  All Masterpieces
                </button>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => setFilters({ ...filters, category: cat.slug })}
                    className={`${filters.category === cat.slug ? 'text-gold' : 'opacity-60'} hover:text-gold transition-colors`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-gold/5 border border-gold/10" />
                ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-40 text-center space-y-6">
                <div className="flex justify-center text-gold/20"><SearchIcon size={80} strokeWidth={1} /></div>
                <h3 className="font-display text-4xl italic">No treasures found</h3>
                <p className="text-sm opacity-60 uppercase tracking-widest">Widen your horizons or search for something else</p>
                <button 
                    onClick={() => setFilters({ category: '', search: '', sort: 'newest' })}
                    className="text-[10px] uppercase tracking-widest font-bold border-b border-gold pb-1 text-gold"
                >
                    Reset All Filters
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
