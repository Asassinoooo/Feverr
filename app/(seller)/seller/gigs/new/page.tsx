import { GigForm } from '@/components/gig/GigForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/seller/gigs', label: 'My Gigs' },
  { href: '/seller/orders', label: 'Incoming Orders' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function NewGigPage() {
  return (
    <DashboardLayout title="Seller" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Create New Gig</h1>
      <GigForm />
    </DashboardLayout>
  );
}
