'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GIG_CATEGORIES } from '@/lib/mock/gigs';

export default function SearchFilter({
  initialQuery,
  initialCategory,
  initialMaxPrice,
  initialMinRating
}: {
  initialQuery: string;
  initialCategory: string;
  initialMaxPrice: number;
  initialMinRating: number;
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [minRating, setMinRating] = useState(initialMinRating);

  // Memicu perubahan URL (SSR) setiap kali filter berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      if (maxPrice !== 5000000) params.set('maxPrice', maxPrice.toString());
      if (minRating !== 0) params.set('rating', minRating.toString());

      router.push(`/search?${params.toString()}`);
    }, 300); // Debounce untuk mencegah spam render

    return () => clearTimeout(timer);
  }, [query, category, maxPrice, minRating, router]);

  return (
    <aside className="lg:w-56 flex-shrink-0">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Filter</h2>

      {/* Search */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
          Kata Kunci
        </label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari jasa..."
          className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5fa0]"
        />
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
          Kategori
        </label>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={category === ''}
              onChange={() => setCategory('')}
              className="accent-[#3b5fa0]"
            />
            <span className="text-slate-600">Semua</span>
          </label>
          {GIG_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className="accent-[#3b5fa0]"
              />
              <span className="text-slate-600">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
          Harga Maks (Rp)
        </label>
        <input
          type="range"
          min={0}
          max={5000000}
          step={50000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#3b5fa0]"
        />
        <div className="text-xs text-slate-500 mt-1">
          s/d Rp {maxPrice.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Min Rating */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
          Rating Minimum
        </label>
        <div className="flex flex-col gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="accent-[#3b5fa0]"
              />
              <span className="text-slate-600">
                {r === 0 ? 'Semua' : `≥ ${r} ★`}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => { setQuery(''); setCategory(''); setMaxPrice(5000000); setMinRating(0); }}
        className="text-xs text-[#3b5fa0] hover:underline"
      >
        Reset filter
      </button>
    </aside>
  );
}