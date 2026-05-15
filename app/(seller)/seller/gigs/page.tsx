'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function SellerGigsPage() {
  const { data: session } = useSession();
  const { gigs, updateGig, deleteGig } = useApp();
  const userId = (session?.user as any)?.id;

  const myGigs = gigs.filter((g) => g.sellerId === userId);

  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Gig Saya</h1>
        <Link href="/seller/gigs/new">
          <Button variant="primary" size="sm">+ Buat Gig Baru</Button>
        </Link>
      </div>

      {myGigs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400 mb-4">Anda belum memiliki gig.</p>
          <Link href="/seller/gigs/new">
            <Button variant="primary">Buat Gig Pertama</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myGigs.map((gig) => (
            <div key={gig.id} className="bg-white border border-slate-200 p-4 flex gap-4">
              <div className="relative w-20 h-14 flex-shrink-0 bg-slate-100">
                <Image
                  src={gig.portfolioImages[0]}
                  alt={gig.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-800 truncate">{gig.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Badge variant={gig.isActive ? 'success' : 'default'}>
                        {gig.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      <span>·</span>
                      <StarRating rating={gig.rating} size="sm" />
                      <span>{gig.rating.toFixed(1)} ({gig.reviewCount})</span>
                      <span>·</span>
                      <span>{formatCurrency(gig.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateGig(gig.id, { isActive: !gig.isActive })}
                      className="text-xs text-slate-500 hover:text-[#3b5fa0]"
                    >
                      {gig.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <Link href={`/seller/gigs/${gig.id}/edit`} className="text-xs text-[#3b5fa0] hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Hapus gig ini?')) deleteGig(gig.id);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
