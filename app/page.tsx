import Link from 'next/link';
import { GIG_CATEGORIES } from '@/lib/mock/gigs';
import { GigCard } from '@/components/gig/GigCard';
import { query } from '@/lib/db';

async function getFeaturedGigs() {
  const res = await query(`
    SELECT g.*, u.username, u.name as seller_name, u.avatar_url as seller_avatar
    FROM gigs g
    JOIN users u ON g.seller_id = u.user_id
    WHERE g.is_active = true
    ORDER BY g.average_rating DESC, g.review_count DESC
    LIMIT 3
  `);
  
  return res.rows.map(row => ({
    ...row,
    id: row.gig_id.toString(),
    sellerId: row.seller_id.toString(),
    portfolioImages: row.portfolio_images || [],
    deliveryDays: row.delivery_days,
    rating: parseFloat(row.average_rating) || 0,
    reviewCount: parseInt(row.review_count) || 0,
    seller: {
      id: row.seller_id.toString(),
      username: row.username,
      name: row.seller_name,
      avatarUrl: row.seller_avatar
    }
  }));
}

export default async function HomePage() {
  const featured = await getFeaturedGigs();

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-semibold text-[#3b5fa0] uppercase tracking-widest mb-4">
                Marketplace Freelance Indonesia
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight mb-6">
                Temukan jasa yang tepat,{' '}
                <span className="text-[#3b5fa0]">mulai hari ini.</span>
              </h1>
              <p className="text-slate-500 text-lg mb-8 max-w-md">
                Dari desain logo hingga pengembangan web — ribuan freelancer siap membantu Anda.
              </p>
              <form action="/search" method="GET" className="flex gap-0 max-w-md">
                <input
                  name="q"
                  type="text"
                  placeholder="Cari jasa desain, penulisan, web..."
                  className="flex-1 border border-slate-300 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3b5fa0] focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-[#3b5fa0] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2d4f8e]"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Right — editorial stats */}
            <div className="hidden lg:flex flex-col gap-6 border-l border-slate-200 pl-12">
              <div>
                <div className="text-4xl font-bold text-[#3b5fa0]">500+</div>
                <div className="text-slate-500 text-sm mt-1">Freelancer aktif</div>
              </div>
              <div className="w-16 h-px bg-slate-200" />
              <div>
                <div className="text-4xl font-bold text-[#3b5fa0]">2.400+</div>
                <div className="text-slate-500 text-sm mt-1">Proyek diselesaikan</div>
              </div>
              <div className="w-16 h-px bg-slate-200" />
              <div>
                <div className="text-4xl font-bold text-[#3b5fa0]">4.8</div>
                <div className="text-slate-500 text-sm mt-1">Rating rata-rata platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#f1f5f9] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Kategori
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {GIG_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-4 py-2 border border-slate-300 text-sm text-slate-600 bg-white hover:border-[#3b5fa0] hover:text-[#3b5fa0]"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Jasa Unggulan</h2>
          <Link href="/search" className="text-sm text-[#3b5fa0] hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((gig) => (
            <GigCard key={gig.id} gig={gig as any} seller={gig.seller as any} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#3b5fa0] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Punya keahlian? Mulai jual jasa Anda.</h3>
            <p className="text-blue-200 text-sm">
              Bergabung dengan ribuan freelancer dan raih penghasilan dari rumah.
            </p>
          </div>
          <Link href="/register">
            <button className="bg-white text-[#3b5fa0] font-medium px-6 py-2.5 text-sm hover:bg-slate-100 flex-shrink-0">
              Mulai Berjualan
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
