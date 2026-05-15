'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const { orders, gigs, users, updateOrderStatus } = useApp();
  const userId = (session?.user as any)?.id;

  const myOrders = orders
    .filter((o) => o.sellerId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Pesanan Masuk</h1>

      {myOrders.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">Belum ada pesanan.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {myOrders.map((order) => {
            const gig = gigs.find((g) => g.id === order.gigId);
            const buyer = users.find((u) => u.id === order.buyerId);
            return (
              <div key={order.id} className="bg-white border border-slate-200 p-4 flex gap-4">
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-slate-800 truncate">{gig?.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        dari {buyer?.name} · {formatDate(order.createdAt)} · {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <OrderStatusBadge status={order.status} />
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        >
                          Mulai Kerjakan
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button size="sm" variant="primary">Kirim</Button>
                        </Link>
                      )}
                      <Link href={`/seller/orders/${order.id}`} className="text-xs text-[#3b5fa0] hover:underline">
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
