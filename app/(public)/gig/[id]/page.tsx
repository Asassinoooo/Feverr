import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { query } from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

async function getGigData(id: string) {
  const gigRes = await query(`
    SELECT g.*, u.username, u.name as seller_name, u.avatar_url as seller_avatar, u.bio as seller_bio
    FROM gigs g
    JOIN users u ON g.seller_id = u.user_id
    WHERE g.gig_id = $1
  `, [id]);

  if (gigRes.rows.length === 0) return null;

  const reviewRes = await query(`
    SELECT r.*, u.username as buyer_username, u.name as buyer_name, u.avatar_url as buyer_avatar
    FROM reviews r
    JOIN users u ON r.buyer_id = u.user_id
    WHERE r.gig_id = $1
    ORDER BY r.created_at DESC
  `, [id]);

  const row = gigRes.rows[0];
  return {
    gig: {
      ...row,
      id: row.gig_id.toString(),
      sellerId: row.seller_id.toString(),
      rating: parseFloat(row.average_rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      deliveryDays: row.delivery_days,
      portfolioImages: row.portfolio_images || []
    },
    seller: {
      id: row.seller_id.toString(),
      username: row.username,
      name: row.seller_name,
      avatarUrl: row.seller_avatar,
      bio: row.seller_bio
    },
    reviews: reviewRes.rows.map(r => ({
      ...r,
      id: r.review_id.toString(),
      createdAt: r.created_at.toISOString()
    }))
  };
}

export default async function GigDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getGigData(id);
  
  if (!data) notFound();
  const { gig, seller, reviews } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Tags */}
          <div className="mb-2">
            <Badge variant="default">{gig.category}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">{gig.title}</h1>

          {/* Rating + seller */}
          <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
            <StarRating rating={gig.rating} size="sm" />
            <span>{gig.rating.toFixed(1)} ({gig.reviewCount} ulasan)</span>
            {seller && (
              <>
                <span>·</span>
                <Link
                  href={`/profile/${seller.username}`}
                  className="flex items-center gap-1.5 hover:text-[#3b5fa0]"
                >
                  <Avatar src={seller.avatarUrl} name={seller.name} size={20} />
                  <span>{seller.name}</span>
                </Link>
              </>
            )}
          </div>

          {/* Portfolio Images */}
          <div className="flex gap-3 overflow-x-auto pb-3 mb-8">
            {gig.portfolioImages.map((img: string, i: number) => (
              <div key={i} className="flex-shrink-0 relative w-72 h-44 border border-slate-200 bg-slate-100">
                <Image
                  src={img}
                  alt={`Portfolio ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Tentang Jasa Ini</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {gig.description}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Tag</h2>
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-xs border border-slate-200 text-slate-600 hover:border-[#3b5fa0] hover:text-[#3b5fa0]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-4">
              Ulasan ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada ulasan untuk jasa ini.</p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="border border-slate-200 bg-white shadow-sm sticky top-20">
            <div className="p-5 border-b border-slate-100">
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(gig.price)}</div>
              <div className="text-xs text-slate-400 mt-0.5">Harga mulai dari</div>
            </div>
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <span>🕐</span>
                <span>Pengiriman dalam <strong>{gig.deliveryDays} hari</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>⭐</span>
                <span><strong>{gig.rating.toFixed(1)}</strong> rating ({gig.reviewCount} ulasan)</span>
              </div>
            </div>
            {seller && (
              <div className="p-5 border-b border-slate-100">
                <Link href={`/profile/${seller.username}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar src={seller.avatarUrl} name={seller.name} size={40} />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{seller.name}</div>
                    <div className="text-xs text-slate-400">@{seller.username}</div>
                  </div>
                </Link>
              </div>
            )}
            <div className="p-5">
              <Link href={`/checkout/${gig.id}`} className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Pesan Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
