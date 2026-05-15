'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { GigForm } from '@/components/gig/GigForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { gigs } = useApp();
  const gig = gigs.find((g) => g.id === id);
  if (!gig) notFound();

  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Gig</h1>
      <GigForm existingGig={gig} />
    </DashboardLayout>
  );
}
