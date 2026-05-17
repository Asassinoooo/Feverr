'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchGigs, updateGig as apiUpdateGig, deleteGig as apiDeleteGig } from '@/lib/api';

const navItems = [
  { href: '/seller/gigs', label: 'My Gigs' },
  { href: '/seller/orders', label: 'Incoming Orders' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function SellerGigsPage() {
  const { data: session } = useSession();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGigs = async () => {
    if (!session?.user) return;
    try {
      const userId = (session.user as any).id;
      const data = await fetchGigs({ sellerId: userId });
      setGigs(data.map((g: any) => ({
        ...g,
        id: g.gig_id.toString(),
        portfolioImages: g.portfolio_images || [],
        isActive: g.is_active,
        rating: parseFloat(g.average_rating) || 0,
        reviewCount: parseInt(g.review_count) || 0
      })));
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGigs();
  }, [session]);

  async function handleToggleActive(gig: any) {
    try {
      await apiUpdateGig(gig.id, { ...gig, isActive: !gig.isActive });
      loadGigs();
    } catch (error) {
      console.error('Error updating gig status:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this gig?')) return;
    try {
      await apiDeleteGig(id);
      loadGigs();
    } catch (error) {
      console.error('Error deleting gig:', error);
    }
  }

  return (
    <DashboardLayout title="Seller" navItems={navItems}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Gigs</h1>
        <Link href="/seller/gigs/new">
          <Button variant="primary" size="sm">+ Create New Gig</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-16 text-center">Loading...</p>
      ) : gigs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400 mb-4">You do not have any gigs yet.</p>
          <Link href="/seller/gigs/new">
            <Button variant="primary">Create First Gig</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gigs.map((gig) => (
            <div key={gig.id} className="bg-white border border-slate-200 p-4 flex gap-4">
              <div className="relative w-20 h-14 flex-shrink-0 bg-slate-100">
                {gig.portfolioImages[0] && (
                  <Image
                    src={gig.portfolioImages[0]}
                    alt={gig.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-800 truncate">{gig.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Badge variant={gig.isActive ? 'success' : 'default'}>
                        {gig.isActive ? 'Active' : 'Inactive'}
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
                      onClick={() => handleToggleActive(gig)}
                      className="text-xs text-slate-500 hover:text-[#3b5fa0]"
                    >
                      {gig.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link href={`/seller/gigs/${gig.id}/edit`} className="text-xs text-[#3b5fa0] hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(gig.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
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
