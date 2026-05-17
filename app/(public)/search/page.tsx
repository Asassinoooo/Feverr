import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { GigCard } from '@/components/gig/GigCard';
import SearchFilter from './SearchFilter';

export const revalidate = 0; 

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; maxPrice?: string; rating?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const maxPrice = Number(resolvedParams.maxPrice) || 100000000; // Default high enough
  const minRating = Number(resolvedParams.rating) || 0;

  const cacheKey = category ? `gigs:category:${category}` : 'gigs:all';
  let gigs = [];

  let cachedData = null;

  if (redis) {
    try {
      cachedData = await redis.get(cacheKey);
    } catch (e) {
      console.warn('Redis error:', e);
    }
  }

  if (cachedData) {
    gigs = JSON.parse(cachedData);
  } else {
    let sql = `
      SELECT
        g.*,
        u.username,
        u.name as seller_name,
        u.avatar_url,
        g.average_rating,
        g.review_count
      FROM gigs g
      JOIN users u ON g.seller_id = u.user_id
      WHERE g.is_active = TRUE
    `;
    const values: any[] = [];

    if (category) {
      sql += ` AND g.category = $1`;
      values.push(category);
    }

    sql += ` ORDER BY g.created_at DESC`;

    const { rows } = await pool.query(sql, values);
    gigs = rows;

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(gigs), 'EX', 3600);
      } catch (e) {
        console.warn('Redis cache save error:', e);
      }
    }
  }

  const filteredGigs = gigs.filter((g: any) => {
    const searchString = `${g.title} ${g.description} ${g.category}`.toLowerCase();
    if (q && !searchString.includes(q.toLowerCase())) return false;
    if (parseFloat(g.price) > maxPrice) return false;
    if (parseFloat(g.average_rating) < minRating) return false;
    return true;
  }).map((g: any) => ({
    id: g.gig_id.toString(),
    title: g.title,
    description: g.description,
    price: parseFloat(g.price),
    category: g.category,
    sellerId: g.seller_id.toString(),
    portfolioImages: g.portfolio_images || [],
    deliveryDays: g.delivery_days || 3,
    rating: parseFloat(g.average_rating) || 0,
    reviewCount: parseInt(g.review_count) || 0,
    seller: {
      id: g.seller_id.toString(),
      username: g.username,
      name: g.seller_name || g.username,
      avatarUrl: g.avatar_url
    }
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <SearchFilter 
          initialQuery={q} 
          initialCategory={category} 
          initialMaxPrice={maxPrice} 
          initialMinRating={minRating} 
        />

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
