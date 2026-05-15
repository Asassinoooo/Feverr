import { GigForm } from '@/components/gig/GigForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function NewGigPage() {
  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Buat Gig Baru</h1>
      <GigForm />
    </DashboardLayout>
  );
}
