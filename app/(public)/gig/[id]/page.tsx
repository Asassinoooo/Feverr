import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { mockGigs } from '@/lib/mock/gigs';
import { mockUsers } from '@/lib/mock/users';
import { mockReviews } from '@/lib/mock/reviews';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GigDetailPage({ params }: Props) {
  const { id } = await params;
  const gig = mockGigs.find((g) => g.id === id);
  if (!gig) notFound();

  const seller = mockUsers.find((u) => u.id === gig.sellerId);
  const reviews = mockReviews.filter((r) => r.gigId === gig.id);

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
            {gig.portfolioImages.map((img, i) => (
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
              {gig.tags.map((tag) => (
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
                {reviews.map((review) => {
                  const buyer = mockUsers.find((u) => u.id === review.buyerId);
                  return (
                    <div key={review.id} className="border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar src={buyer?.avatarUrl} name={buyer?.name || 'User'} size={28} />
                        <span className="text-sm font-medium text-slate-700">{buyer?.name}</span>
                        <span className="text-slate-300">·</span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600">{review.comment}</p>
                    </div>
                  );
                })}
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
