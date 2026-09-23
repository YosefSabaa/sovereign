'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getProducts, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    getProducts().then(p => {
      setProducts(p);
      setFiltered(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    setFiltered(result);
  }, [search, category, products]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-black text-navy-700 mb-8 text-center">
        {t('nav.products')}
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="input pl-12"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-navy-700 border border-gray-300 hover:border-teal-500'
              }`}>
              {c === 'all' ? t('common.all') : c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse h-80 bg-gray-200"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}