'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GIG_CATEGORIES } from '@/lib/mock/gigs';
import { GigCard } from '@/components/gig/GigCard';
import { fetchGigs } from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 5000000);
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGigs = async () => {
      setLoading(true);
      try {
        const data = await fetchGigs({ q: query, category });
        // Client side filtering for price and rating if backend doesn't support it yet
        const filtered = data.filter((g: any) => {
          if (g.price > maxPrice) return false;
          if (g.average_rating < minRating) return false;
          return true;
        }).map((g: any) => ({
          ...g,
          id: g.gig_id.toString(),
          sellerId: g.seller_id.toString(),
          portfolioImages: g.portfolio_images || [],
          deliveryDays: g.delivery_days,
          rating: parseFloat(g.average_rating) || 0,
          reviewCount: parseInt(g.review_count) || 0,
          seller: {
            id: g.seller_id.toString(),
            username: g.username,
            name: g.seller_name,
            avatarUrl: g.seller_avatar
          }
        }));
        setResults(filtered);
      } catch (error) {
        console.error('Error loading gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadGigs, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query, category, maxPrice, minRating]);

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
            onClick={() => { setQuery(''); setCategory(''); setMaxPrice(5000000); setMinRating(0); }}
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

          {loading ? (
            <div className="py-16 text-center text-slate-400">Memuat...</div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Tidak ada jasa yang sesuai dengan filter Anda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((gig) => (
                <GigCard key={gig.id} gig={gig} seller={gig.seller} />
              ))}
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
