'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/dashboard/orders', label: 'Pesanan Saya' },
  { href: '/settings/profile', label: 'Pengaturan Profil' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function BuyerOrdersPage() {
  const { data: session } = useSession();
  const { orders, gigs, users } = useApp();
  const userId = (session?.user as any)?.id;

  const myOrders = orders.filter((o) => o.buyerId === userId);
  const active = myOrders.filter((o) =>
    ['pending', 'in_progress', 'delivered'].includes(o.status)
  );
  const history = myOrders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  function OrderList({ list }: { list: typeof myOrders }) {
    if (list.length === 0) {
      return <p className="text-sm text-slate-400 py-8 text-center">Tidak ada pesanan.</p>;
    }
    return (
      <div className="flex flex-col gap-3">
        {list.map((order) => {
          const gig = gigs.find((g) => g.id === order.gigId);
          const seller = users.find((u) => u.id === order.sellerId);
          return (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex gap-4 bg-white border border-slate-200 p-4 hover:border-[#3b5fa0] group"
            >
              {gig && (
                <div className="relative w-16 h-12 flex-shrink-0 bg-slate-100">
                  <Image
                    src={gig.portfolioImages[0]}
                    alt={gig.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-slate-800 truncate group-hover:text-[#3b5fa0]">
                    {gig?.title || 'Jasa Dihapus'}
                  </h3>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  oleh {seller?.name} · {formatDate(order.createdAt)} · {formatCurrency(order.totalPrice)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <DashboardLayout title="Pembeli" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Pesanan Saya</h1>
      <Tabs
        tabs={[
          { id: 'active', label: `Aktif (${active.length})` },
          { id: 'history', label: `Riwayat (${history.length})` },
        ]}
      >
        {(tab) => tab === 'active' ? <OrderList list={active} /> : <OrderList list={history} />}
      </Tabs>
    </DashboardLayout>
  );
}
