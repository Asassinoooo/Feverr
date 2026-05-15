'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockGigs, GIG_CATEGORIES } from '@/lib/mock/gigs';
import { mockUsers } from '@/lib/mock/users';
import { GigCard } from '@/components/gig/GigCard';

function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 5000000);
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);

  const results = mockGigs.filter((g) => {
    if (!g.isActive) return false;
    if (query && !g.title.toLowerCase().includes(query.toLowerCase()) &&
        !g.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) return false;
    if (category && g.category !== category) return false;
    if (g.price < minPrice || g.price > maxPrice) return false;
    if (g.rating < minRating) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
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
            onClick={() => { setQuery(''); setCategory(''); setMinPrice(0); setMaxPrice(5000000); setMinRating(0); }}
            className="text-xs text-[#3b5fa0] hover:underline"
          >
            Reset filter
          </button>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{results.length}</span> jasa ditemukan
            </p>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Tidak ada jasa yang sesuai dengan filter Anda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((gig) => {
                const seller = mockUsers.find((u) => u.id === gig.sellerId);
                return <GigCard key={gig.id} gig={gig} seller={seller} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Memuat...</div>}>
      <SearchContent />
    </Suspense>
  );
}
