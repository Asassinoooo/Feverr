import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { GigCard } from '@/components/gig/GigCard';
import SearchFilter from './SearchFilter';

export const revalidate = 0; // Memastikan komponen ini dinamis

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; maxPrice?: string; rating?: string }>;
}) {
  // Mengekstrak parameter dari URL
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const maxPrice = Number(resolvedParams.maxPrice) || 5000000;
  const minRating = Number(resolvedParams.rating) || 0;

  // Set up Redis Cache Key
  const cacheKey = category ? `gigs:category:${category}` : 'gigs:all';
  let gigs = [];

  // Mengecek apakah data mentah ada di Redis
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    gigs = JSON.parse(cachedData);
  } else {
    // Fallback ke PostgreSQL (Neon) jika cache tidak ada
    let query = `
      SELECT 
        g.*, 
        u.username, 
        u.avatar_url, 
        u.average_rating,
        (SELECT COUNT(*) FROM Reviews r WHERE r.seller_id = u.user_id) as review_count
      FROM Gigs g 
      JOIN Users u ON g.seller_id = u.user_id 
      WHERE g.is_active = TRUE
    `;
    const values: any[] = [];

    if (category) {
      query += ` AND g.category_id = $1`;
      values.push(category);
    }

    query += ` ORDER BY g.created_at DESC`;

    const { rows } = await pool.query(query, values);
    gigs = rows;

    // Simpan ke Redis (Cache selama 1 Jam)
    await redis.set(cacheKey, JSON.stringify(gigs), 'EX', 3600);
  }

  // Melakukan filtering di memori server untuk parameter sisa (q, price, rating)
  const filteredGigs = gigs.filter((g: any) => {
    const searchString = `${g.title} ${g.description}`.toLowerCase();
    if (q && !searchString.includes(q.toLowerCase())) return false;
    if (parseFloat(g.price) > maxPrice) return false;
    if (parseFloat(g.average_rating) < minRating) return false;
    return true;
  }).map((g: any) => ({
    id: g.gig_id.toString(),
    title: g.title,
    description: g.description,
    price: parseFloat(g.price),
    category: g.category_id,
    sellerId: g.seller_id.toString(),
    portfolioImages: [], // Karena kolom ini belum ada di DDL sebelumnya
    deliveryDays: 3,     // Default value jika kolom belum ada
    rating: parseFloat(g.average_rating) || 0,
    reviewCount: parseInt(g.review_count) || 0,
    seller: {
      id: g.seller_id.toString(),
      username: g.username,
      name: g.username,
      avatarUrl: g.avatar_url || '/avatar.png'
    }
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menyisipkan Client Component Sidebar */}
        <SearchFilter 
          initialQuery={q} 
          initialCategory={category} 
          initialMaxPrice={maxPrice} 
          initialMinRating={minRating} 
        />

        {/* Hasil Render Server */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filteredGigs.length}</span> jasa ditemukan
            </p>
          </div>

          {filteredGigs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Tidak ada jasa yang sesuai dengan filter Anda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGigs.map((gig: any) => (
                <GigCard key={gig.id} gig={gig} seller={gig.seller} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}