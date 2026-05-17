import Link from 'next/link';
import Image from 'next/image';
import { Gig, User } from '@/lib/types';
import { formatCurrency, truncate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';

interface GigCardProps {
  gig: Gig;
  seller?: User;
}

export function GigCard({ gig, seller }: GigCardProps) {
  return (
    <Link href={`/gig/${gig.id}`} className="group block">
      <div className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Portfolio Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <Image
            src={gig.portfolioImages[0] || 'https://picsum.photos/seed/default/800/500'}
            alt={gig.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        {/* Content */}
        <div className="p-4">
          {/* Seller */}
          {seller && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar src={seller.avatarUrl} name={seller.name} size={24} />
              <span className="text-xs text-slate-500">{seller.name}</span>
            </div>
          )}
          {/* Title */}
          <h3 className="text-sm font-medium text-slate-800 leading-snug group-hover:text-[#3b5fa0]">
            {truncate(gig.title, 60)}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <StarRating rating={gig.rating} size="sm" />
            <span className="text-xs text-slate-500">
              {gig.rating.toFixed(1)} ({gig.reviewCount})
            </span>
          </div>
          {/* Price */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Starting from</span>
            <span className="text-sm font-semibold text-slate-800">
              {formatCurrency(gig.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
