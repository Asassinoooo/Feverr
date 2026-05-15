import { notFound } from 'next/navigation';
import { mockUsers } from '@/lib/mock/users';
import { mockGigs } from '@/lib/mock/gigs';
import { mockReviews } from '@/lib/mock/reviews';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { GigCard } from '@/components/gig/GigCard';
import { StarRating } from '@/components/ui/StarRating';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = mockUsers.find((u) => u.username === username);
  if (!user) notFound();

  const gigs = mockGigs.filter((g) => g.sellerId === user.id && g.isActive);
  const reviews = mockReviews.filter((r) => r.sellerId === user.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-slate-200 pb-8 mb-8">
        <Avatar src={user.avatarUrl} name={user.name} size={80} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="text-slate-400 text-sm mb-2">@{user.username}</p>
          <p className="text-slate-600 text-sm max-w-lg mb-4">{user.bio}</p>
          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">{gigs.length}</span> jasa aktif
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={avgRating} size="sm" />
                <span className="font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
                <span>({reviews.length} ulasan)</span>
              </div>
            )}
            <div>Bergabung {formatDate(user.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Gigs */}
      {gigs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Jasa Ditawarkan</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} seller={user} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-5">
            Ulasan Diterima ({reviews.length})
          </h2>
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
        </div>
      )}

      {gigs.length === 0 && (
        <p className="text-slate-400 text-sm">Pengguna ini belum menawarkan jasa.</p>
      )}
    </div>
  );
}
