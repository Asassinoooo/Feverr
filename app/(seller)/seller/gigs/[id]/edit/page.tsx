'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { GigForm } from '@/components/gig/GigForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchGig } from '@/lib/api';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGig = async () => {
      try {
        const data = await fetchGig(id);
        setGig({
          ...data,
          id: data.gig_id.toString(),
          sellerId: data.seller_id.toString(),
          portfolioImages: data.portfolio_images || [],
          isActive: data.is_active,
          deliveryDays: data.delivery_days
        });
      } catch (error) {
        console.error('Error fetching gig:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGig();
  }, [id]);

  if (loading) return <div className="p-8 text-slate-400">Memuat...</div>;
  if (!gig) notFound();

  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Gig</h1>
      <GigForm existingGig={gig} />
    </DashboardLayout>
  );
}
