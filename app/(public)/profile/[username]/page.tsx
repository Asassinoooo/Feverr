import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { GigCard } from '@/components/gig/GigCard';
import { StarRating } from '@/components/ui/StarRating';
import { query } from '@/lib/db';

interface Props {
  params: Promise<{ username: string }>;
}

async function getProfileData(username: string) {
  const userRes = await query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  if (userRes.rows.length === 0) return null;
  const user = userRes.rows[0];

  const gigsRes = await query(
    'SELECT * FROM gigs WHERE seller_id = $1 AND is_active = true',
    [user.user_id]
  );

  const reviewsRes = await query(`
    SELECT r.*, u.name as buyer_name, u.avatar_url as buyer_avatar
    FROM reviews r
    JOIN users u ON r.buyer_id = u.user_id
    WHERE r.seller_id = $1
    ORDER BY r.created_at DESC
  `, [user.user_id]);

  return {
    user: {
      ...user,
      id: user.user_id.toString(),
      avatarUrl: user.avatar_url,
      createdAt: user.created_at.toISOString()
    },
    gigs: gigsRes.rows.map(g => ({
      ...g,
      id: g.gig_id.toString(),
      sellerId: g.seller_id.toString(),
      portfolioImages: g.portfolio_images || []
    })),
    reviews: reviewsRes.rows.map(r => ({
      ...r,
      id: r.review_id.toString(),
      createdAt: r.created_at.toISOString()
    }))
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await getProfileData(username);
  
  if (!data) notFound();
  const { user, gigs, reviews } = data;

  const avgRating = parseFloat(user.average_rating) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-slate-200 pb-8 mb-8">
        <Avatar src={user.avatarUrl} name={user.name} size={80} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="text-slate-400 text-sm mb-2">@{user.username}</p>
          <p className="text-slate-600 text-sm max-w-lg mb-4">{user.bio}</p>
          <div className="flex flex-col gap-2 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>Registered {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💼</span>
              <span>0 active orders</span>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={avgRating} size="sm" />
                <span className="font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gigs */}
      {gigs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Offered Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gigs.map((gig: any) => (
              <GigCard key={gig.id} gig={gig} seller={user as any} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-5">
            Reviews Received ({reviews.length})
          </h2>
          <div className="flex flex-col gap-5">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={review.buyer_avatar} name={review.buyer_name || 'User'} size={28} />
                  <span className="text-sm font-medium text-slate-700">{review.buyer_name}</span>
                  <span className="text-slate-300">·</span>
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gigs.length === 0 && (
        <p className="text-sm text-slate-400 py-8">This seller does not have any gigs yet.</p>
      )}
    </div>
  );
}
